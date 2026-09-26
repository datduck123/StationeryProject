package fpt.edu.vn.stationery.config;

import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import jakarta.persistence.Table;
import org.hibernate.boot.model.naming.Identifier;
import org.junit.jupiter.api.Test;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderTableNamingStrategyTest {

    @Test
    void mapsOrderTablesToTheirExactSqlServerNames() {
        OrderTableNamingStrategy strategy = new OrderTableNamingStrategy();
        assertEquals("Orders", Order.class.getAnnotation(Table.class).name());
        assertEquals("OrderItems", OrderItem.class.getAnnotation(Table.class).name());

        Identifier orders = strategy.toPhysicalTableName(Identifier.toIdentifier("Orders"), null);
        Identifier orderItems = strategy.toPhysicalTableName(Identifier.toIdentifier("OrderItems"), null);
        assertEquals("Orders", orders.getText());
        assertEquals("OrderItems", orderItems.getText());
        assertTrue(orders.isQuoted());
        assertTrue(orderItems.isQuoted());
    }

    @Test
    void registersTheStrategyWithHibernate() {
        OrderTableNamingStrategy strategy = new OrderTableNamingStrategy();
        var properties = new HashMap<String, Object>();
        strategy.customize(properties);
        assertSame(strategy, properties.get("hibernate.physical_naming_strategy"));
    }
}
