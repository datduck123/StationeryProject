package fpt.edu.vn.stationery.config;

import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;

/** Preserve exact table names in SQL Server (Orders, OrderItems, CartItems). */
@Component
public class OrderTableNamingStrategy extends CamelCaseToUnderscoresNamingStrategy
        implements HibernatePropertiesCustomizer {

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment jdbcEnvironment) {
        if (name != null) {
            if ("OrderItems".equalsIgnoreCase(name.getText())) {
                return Identifier.toIdentifier("OrderItems", true);
            }
            if ("Orders".equalsIgnoreCase(name.getText())) {
                return Identifier.toIdentifier("Orders", true);
            }
            if ("CartItems".equalsIgnoreCase(name.getText())) {
                return Identifier.toIdentifier("CartItems", true);
            }
        }
        return super.toPhysicalTableName(name, jdbcEnvironment);
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put("hibernate.physical_naming_strategy", this);
    }
}
