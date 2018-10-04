package ru.mail.jira.plugins.groovy.util.tx;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

@Component
public final class TransactionalAnnotationProcessor implements BeanPostProcessor {
    private final Logger logger = LoggerFactory.getLogger(TransactionalAnnotationProcessor.class);

    private final TransactionalInterceptor interceptor = new TransactionalInterceptor();

    public Object postProcessBeforeInitialization(Object o, String s) throws BeansException {
        return o;
    }

    public Object postProcessAfterInitialization(Object bean, String name) throws BeansException {
        try {
            Class<?> beanClass = bean.getClass();

            //ignore 3rd party beans
            if (beanClass.getCanonicalName().startsWith("ru.mail.jira.plugins.groovy")) {
                if (TransactionalInterceptor.isAnnotated(beanClass)) {
                    ProxyFactory proxyFactory = new ProxyFactory(bean);
                    proxyFactory.addAdvice(interceptor);

                    return proxyFactory.getProxy(TransactionalAnnotationProcessor.class.getClassLoader());
                }
                else return bean;
            }
        } catch (Exception e) {
            logger.warn("Unable to process bean {} - {}", name, bean, e);
        }
        return bean;
    }
}