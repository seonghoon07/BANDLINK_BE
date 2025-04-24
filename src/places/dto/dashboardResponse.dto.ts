export class DashboardResponseDto {
  todayReservationCount: number;
  firstEnterTime: string | null;
  lastLeaveTime: string | null;
  currentMonthRevenue: number;
  diffWithLastMonth: number;
}
