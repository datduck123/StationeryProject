package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.response.*;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.repository.OrderRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final List<String> STANDARD_STATUSES = List.of(
            "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"
    );

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    public DashboardKpiResponseDTO getDashboardKpis() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumDeliveredRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return DashboardKpiResponseDTO.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    public DashboardChartsResponseDTO getDashboardCharts(String period) {
        // 1. Low stock products (stock <= 5)
        List<Product> lowStockEntities = productRepository.findByStockLessThanEqualOrderByStockAsc(LOW_STOCK_THRESHOLD);
        List<LowStockProductDTO> lowStockProducts = lowStockEntities.stream()
                .map(this::mapToLowStockDto)
                .toList();

        // 2. Order status distribution
        Map<String, Long> statusCounts = buildOrderStatusCounts();
        long totalOrders = statusCounts.values().stream().mapToLong(Long::longValue).sum();

        List<OrderStatusCountDTO> statusDistribution = statusCounts.entrySet().stream()
                .map(entry -> {
                    double percentage = totalOrders > 0
                            ? Math.round((entry.getValue() * 100.0 / totalOrders) * 10.0) / 10.0
                            : 0.0;
                    return OrderStatusCountDTO.builder()
                            .status(entry.getKey())
                            .count(entry.getValue())
                            .percentage(percentage)
                            .build();
                })
                .toList();

        // 3. Weekly chart data (Last 7 days)
        List<ChartDataPointDTO> weeklyChart = buildWeeklyChartData();

        // 4. Monthly chart data (Last 6 months)
        List<ChartDataPointDTO> monthlyChart = buildMonthlyChartData();

        // 5. Selected period
        String selectedPeriod = (period != null && period.equalsIgnoreCase("month")) ? "month" : "week";
        List<ChartDataPointDTO> activeChartData = "month".equals(selectedPeriod) ? monthlyChart : weeklyChart;

        return DashboardChartsResponseDTO.builder()
                .lowStockProducts(lowStockProducts)
                .orderStatusDistribution(statusDistribution)
                .orderStatusCounts(statusCounts)
                .weeklyChart(weeklyChart)
                .monthlyChart(monthlyChart)
                .selectedPeriod(selectedPeriod)
                .chartData(activeChartData)
                .build();
    }

    private LowStockProductDTO mapToLowStockDto(Product p) {
        return LowStockProductDTO.builder()
                .productId(p.getProductId())
                .sku(p.getSku())
                .name(p.getName())
                .price(p.getPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .build();
    }

    private Map<String, Long> buildOrderStatusCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String status : STANDARD_STATUSES) {
            counts.put(status, 0L);
        }

        List<Object[]> queryResults = orderRepository.countOrdersByStatus();
        if (queryResults != null) {
            for (Object[] row : queryResults) {
                if (row.length >= 2 && row[0] != null) {
                    String status = row[0].toString().toUpperCase();
                    Long count = ((Number) row[1]).longValue();
                    counts.put(status, count);
                }
            }
        }
        return counts;
    }

    private List<ChartDataPointDTO> buildWeeklyChartData() {
        LocalDate today = LocalDate.now();
        LocalDate startDay = today.minusDays(6);
        LocalDateTime sinceTime = startDay.atStartOfDay();

        List<Order> orders = orderRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(sinceTime);

        // Group orders by LocalDate
        Map<LocalDate, List<Order>> ordersByDate = new HashMap<>();
        for (Order order : orders) {
            if (order.getCreatedAt() != null) {
                LocalDate orderDate = order.getCreatedAt().toLocalDate();
                ordersByDate.computeIfAbsent(orderDate, k -> new ArrayList<>()).add(order);
            }
        }

        List<ChartDataPointDTO> chartPoints = new ArrayList<>();
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM dd", Locale.ENGLISH);

        for (int i = 0; i < 7; i++) {
            LocalDate date = startDay.plusDays(i);
            List<Order> dayOrders = ordersByDate.getOrDefault(date, Collections.emptyList());

            long orderCount = dayOrders.size();
            long deliveredCount = dayOrders.stream()
                    .filter(o -> "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
                    .count();

            BigDecimal revenue = dayOrders.stream()
                    .filter(o -> "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
                    .map(o -> o.getTotalCost() != null ? o.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            String label = dayName + ", " + date.format(labelFormatter);

            chartPoints.add(ChartDataPointDTO.builder()
                    .label(label)
                    .date(date.toString())
                    .orders(orderCount)
                    .deliveredOrders(deliveredCount)
                    .revenue(revenue)
                    .build());
        }

        return chartPoints;
    }

    private List<ChartDataPointDTO> buildMonthlyChartData() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth startMonth = currentMonth.minusMonths(5);
        LocalDateTime sinceTime = startMonth.atDay(1).atStartOfDay();

        List<Order> orders = orderRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(sinceTime);

        // Group orders by YearMonth
        Map<YearMonth, List<Order>> ordersByMonth = new HashMap<>();
        for (Order order : orders) {
            if (order.getCreatedAt() != null) {
                YearMonth ym = YearMonth.from(order.getCreatedAt());
                ordersByMonth.computeIfAbsent(ym, k -> new ArrayList<>()).add(order);
            }
        }

        List<ChartDataPointDTO> chartPoints = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

        for (int i = 0; i < 6; i++) {
            YearMonth ym = startMonth.plusMonths(i);
            List<Order> monthOrders = ordersByMonth.getOrDefault(ym, Collections.emptyList());

            long orderCount = monthOrders.size();
            long deliveredCount = monthOrders.stream()
                    .filter(o -> "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
                    .count();

            BigDecimal revenue = monthOrders.stream()
                    .filter(o -> "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
                    .map(o -> o.getTotalCost() != null ? o.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            chartPoints.add(ChartDataPointDTO.builder()
                    .label(ym.format(monthFormatter))
                    .date(ym.toString())
                    .orders(orderCount)
                    .deliveredOrders(deliveredCount)
                    .revenue(revenue)
                    .build());
        }

        return chartPoints;
    }
}
