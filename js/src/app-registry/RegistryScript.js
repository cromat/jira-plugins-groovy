//@flow
import React, {type Node} from 'react';

import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import memoizeOne from 'memoize-one';

import Button from '@atlaskit/button';
import DropdownMenu, {DropdownItemGroup, DropdownItem} from '@atlaskit/dropdown-menu';
import Lozenge from '@atlaskit/lozenge';

import MoreVerticalIcon from '@atlaskit/icon/glyph/more-vertical';
import WatchIcon from '@atlaskit/icon/glyph/watch';
import WatchFilledIcon from '@atlaskit/icon/glyph/watch-filled';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';

import {RegistryActionCreators} from './redux/actions';

import {WorkflowsDialog} from './WorkflowsDialog';
import type {DeleteCallback, EditCallback, RegistryScriptType} from './types';

import {CommonMessages} from '../i18n/common.i18n';
import {RegistryMessages} from '../i18n/registry.i18n';

import {registryService, watcherService} from '../service/services';

import Script from '../common/script';


type RegistryScriptConnectProps = {
    scriptWatches: Array<number>,
    addWatch: typeof RegistryActionCreators.addWatch,
    removeWatch: typeof RegistryActionCreators.removeWatch,
};

export type PublicRegistryScriptProps = {
    script: RegistryScriptType,
    onEdit: EditCallback,
    onDelete: DeleteCallback,
    title?: Node,
    children?: Node,
    wrapperProps?: any
};

export type RegistryScriptProps = PublicRegistryScriptProps & RegistryScriptConnectProps;

type RegistryScriptState = {
    showWorkflows: boolean,
    waitingWatch: boolean
};

class RegistryScriptInternal extends React.PureComponent<RegistryScriptProps, RegistryScriptState> {
    state = {
        showWorkflows: false,
        waitingWatch: false
    };

    _toggleWorkflows = () => {
        this.setState(
            (state: RegistryScriptState): * => {
                return {
                    showWorkflows: !state.showWorkflows
                };
            }
        );
    };

    _toggleWatch = () => {
        const {script, scriptWatches, addWatch, removeWatch} = this.props;

        const isWatching = scriptWatches.includes(script.id);

        this.setState({ waitingWatch: true });

        const promise = isWatching ?
            watcherService.stopWatching('REGISTRY_SCRIPT', script.id) :
            watcherService.startWatching('REGISTRY_SCRIPT', script.id);

        promise.then(
            () => {
                (isWatching ? removeWatch : addWatch)('script', script.id);
                this.setState({waitingWatch: false});
            },
            (error: any) => {
                this.setState({waitingWatch: false});
                throw error;
            }
        );
    };

    _getChangelogs = () => registryService.getScriptChangelogs(this.props.script.id);

    _onDelete = () => this.props.onDelete(this.props.script.id, 'script', this.props.script.name);

    render() {
        const {script, scriptWatches, wrapperProps, onEdit, onDelete, ...props} = this.props;
        const {showWorkflows, waitingWatch} = this.state;

        const isWatching = scriptWatches.includes(script.id);

        return (
            <div {...wrapperProps}>
                {showWorkflows && <WorkflowsDialog id={script.id} onClose={this._toggleWorkflows}/>}
                <Script
                    {...props}

                    script={{...script}}
                    changelogsLoader={this._getChangelogs}

                    withChangelog={true}

                    additionalButtons={[
                        <Button
                            key="edit"
                            appearance="subtle"
                            iconBefore={<EditFilledIcon label=""/>}

                            component={Link}
                            to={`/script/edit/${script.id}`}
                        />,
                        <Button
                            key="watch"
                            appearance="subtle"
                            isDisabled={waitingWatch}
                            iconBefore={isWatching ? <WatchFilledIcon label=""/> : <WatchIcon label=""/>}

                            onClick={this._toggleWatch}
                        />,
                        <DropdownMenu
                            key="etc"

                            position="bottom right"

                            triggerType="button"
                            triggerButtonProps={{
                                appearance: 'subtle',
                                iconBefore: <MoreVerticalIcon label=""/>
                            }}
                        >
                            <DropdownItemGroup>
                                <DropdownItem onClick={this._toggleWorkflows}>
                                    {RegistryMessages.findWorkflows}
                                </DropdownItem>
                                <DropdownItem onClick={this._onDelete}>
                                    {CommonMessages.delete}
                                </DropdownItem>
                            </DropdownItemGroup>
                        </DropdownMenu>
                    ]}
                >
                    <div className="flex-row" style={{marginBottom: '5px'}}>
                        {script.types.map(type =>
                            <div style={{marginRight: '5px'}} key={type}>
                                <Lozenge appearance="new" isBold={true}>{type}</Lozenge>
                            </div>
                        )}
                    </div>
                </Script>
            </div>
        );
    }
}

export const RegistryScript =
    connect(
        memoizeOne(({scriptWatches}: *): * => {
            return {
                scriptWatches
            };
        }),
        {
            addWatch: RegistryActionCreators.addWatch,
            removeWatch: RegistryActionCreators.removeWatch
        }
    )(RegistryScriptInternal);
