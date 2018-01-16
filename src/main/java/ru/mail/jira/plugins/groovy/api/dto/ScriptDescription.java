package ru.mail.jira.plugins.groovy.api.dto;

import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.List;

@Getter @Setter
@XmlRootElement
public class ScriptDescription {
    @XmlElement
    private int id;
    @XmlElement
    private String name;
    @XmlElement
    private List<ScriptParamDto> params;
}