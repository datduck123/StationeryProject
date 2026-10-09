package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.response.DashboardChartsResponseDTO;
import fpt.edu.vn.stationery.dto.response.DashboardKpiResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import fpt.edu.vn.stationery.entity.Category;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.repository.OrderRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void getDashboardKpis_Success() {
        when(userRepository.count()).thenReturn(150L);
        when(productRepository.count()).thenReturn(45L);
        when(orderRepository.count()).thenReturn(80L);
        when(orderRepository.sumDeliveredRevenue()).thenReturn(new BigDecimal("12500000.00"));

        DashboardKpiResponseDTO result = dashboardService.getDashboardKpis();

        assertNotNull(result);
        assertEquals(150L, result.getTotalUsers());
        assertEquals(45L, result.getTotalProducts());
        assertEquals(80L, result.getTotalOrders());
        assertEquals(new BigDecimal("12500000.00"), result.getTotalRevenue());
    }

    @Test
    void getDashboardKpis_NullRevenue_ReturnsZero() {
        when(userRepository.count()).thenReturn(0L);
        when(productRepository.count()).thenReturn(0L);
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.sumDeliveredRevenue()).thenReturn(null);

        DashboardKpiResponseDTO result = dashboardService.getDashboardKpis();

        assertNotNull(result);
        assertEquals(0L, result.getTotalUsers());
        assertEquals(0L, result.getTotalProducts());
        assertEquals(0L, result.getTotalOrders());
        assertEquals(BigDecimal.ZERO, result.getTotalRevenue());
    }

    @Test
    void getDashboardCharts_WeekPeriod_Success() {
        Category cat = Category.builder().categoryId(1L).name("Pens").build();
        Brand brand = Brand.builder().brandId(1L).name("Pilot").build();
        Product product = Product.builder()
                .productId(10L)
                .name("Pilot Pen")
                .sku("PILOT-01")
                .price(new BigDecimal("25.00"))
                .stock(3)
                .category(cat)
                .brand(brand)
                .status(ProductStatus.ACTIVE)
                .build();

        when(productRepository.findByStockLessThanEqualOrderByStockAsc(5)).thenReturn(List.of(product));

        List<Object[]> statusQueryResults = List.of(
                new Object[]{"PENDING", 5L},
                new Object[]{"DELIVERED", 15L}
        );
        when(orderRepository.countOrdersByStatus()).thenReturn(statusQueryResults);

        Order order = Order.builder()
                .orderId(101L)
                .orderStatus("DELIVERED")
                .totalCost(new BigDecimal("50.00"))
                .createdAt(LocalDateTime.now())
                .build();

        when(orderRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of(order));
        when(userRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of());

        DashboardChartsResponseDTO result = dashboardService.getDashboardCharts("7d");

        assertNotNull(result);
        assertEquals("7d", result.getSelectedPeriod());
        assertNotNull(result.getLowStockProducts());
        assertEquals(1, result.getLowStockProducts().size());
        assertEquals(3, result.getLowStockProducts().get(0).getStock());
        assertEquals("Pilot Pen", result.getLowStockProducts().get(0).getName());
        assertEquals("Pens", result.getLowStockProducts().get(0).getCategoryName());
        assertEquals("Pilot", result.getLowStockProducts().get(0).getBrandName());

        assertNotNull(result.getOrderStatusCounts());
        assertEquals(5L, result.getOrderStatusCounts().get("PENDING"));
        assertEquals(15L, result.getOrderStatusCounts().get("DELIVERED"));
        assertEquals(0L, result.getOrderStatusCounts().get("CANCELLED"));

        assertNotNull(result.getSevenDaysChart());
        assertEquals(7, result.getSevenDaysChart().size());

        assertNotNull(result.getThirtyDaysChart());
        assertEquals(30, result.getThirtyDaysChart().size());

        assertNotNull(result.getYearlyChart());
        assertEquals(12, result.getYearlyChart().size());

        assertEquals(result.getSevenDaysChart(), result.getChartData());
    }

    @Test
    void getDashboardCharts_MonthPeriod_Success() {
        when(productRepository.findByStockLessThanEqualOrderByStockAsc(5)).thenReturn(List.of());
        when(orderRepository.countOrdersByStatus()).thenReturn(List.of());
        when(orderRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(userRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of());

        DashboardChartsResponseDTO result = dashboardService.getDashboardCharts("30d");

        assertNotNull(result);
        assertEquals("30d", result.getSelectedPeriod());
        assertEquals(result.getThirtyDaysChart(), result.getChartData());
    }

    @Test
    void getDashboardCharts_YearPeriod_Success() {
        when(productRepository.findByStockLessThanEqualOrderByStockAsc(5)).thenReturn(List.of());
        when(orderRepository.countOrdersByStatus()).thenReturn(List.of());
        when(orderRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(userRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of());

        DashboardChartsResponseDTO result = dashboardService.getDashboardCharts("year");

        assertNotNull(result);
        assertEquals("year", result.getSelectedPeriod());
        assertEquals(result.getYearlyChart(), result.getChartData());
    }
}
