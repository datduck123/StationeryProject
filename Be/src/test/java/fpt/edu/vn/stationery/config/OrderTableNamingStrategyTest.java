package fpt.edu.vn.stationery.config;

import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.entity.Notification;
import jakarta.persistence.Table;
import org.hibernate.boot.model.naming.Identifier;
import org.junit.jupiter.api.Test;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class OrderTableNamingStrategyTest {

    @ParameterizedTest
    @ValueSource(strings = {"CartItems", "Reviews", "Payments", "Vouchers"})
    void preservesIntegratedTableNames(String table) {
        Identifier physical = new OrderTableNamingStrategy().toPhysicalTableName(Identifier.toIdentifier(table), null);
        assertEquals(table, physical.getText());
        assertTrue(physical.isQuoted());
    }

    @Test
    void mapsOrderTablesToTheirExactSqlServerNames() {
        OrderTableNamingStrategy strategy = new OrderTableNamingStrategy();
        assertEquals("Orders", Order.class.getAnnotation(Table.class).name());
        assertEquals("OrderItems", OrderItem.class.getAnnotation(Table.class).name());
        assertEquals("Notifications", Notification.class.getAnnotation(Table.class).name());

        Identifier orders = strategy.toPhysicalTableName(Identifier.toIdentifier("Orders"), null);
        Identifier orderItems = strategy.toPhysicalTableName(Identifier.toIdentifier("OrderItems"), null);
        Identifier notifications = strategy.toPhysicalTableName(Identifier.toIdentifier("Notifications"), null);
        assertEquals("Orders", orders.getText());
        assertEquals("OrderItems", orderItems.getText());
        assertEquals("Notifications", notifications.getText());
        assertTrue(orders.isQuoted());
        assertTrue(orderItems.isQuoted());
        assertTrue(notifications.isQuoted());
    }

    @Test
    void registersTheStrategyWithHibernate() {
        OrderTableNamingStrategy strategy = new OrderTableNamingStrategy();
        var properties = new HashMap<String, Object>();
        strategy.customize(properties);
        assertSame(strategy, properties.get("hibernate.physical_naming_strategy"));
    }
}
