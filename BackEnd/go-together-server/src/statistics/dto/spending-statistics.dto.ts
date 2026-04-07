export type TripSpendingItemDto = {
  tripId: string;
  tripName: string;
  totalAmount: number;
  expenseCount: number;
};

export type CategorySpendingItemDto = {
  categoryId: string;
  categoryName: string;
  color: string | null;
  icon: string | null;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
};

export type SpendingStatisticsResponseDto = {
  month: number;
  year: number;
  monthLabel: string;
  totalAcrossTrips: number;
  trips: TripSpendingItemDto[];
  selectedTripId: string | null;
  categories: CategorySpendingItemDto[];
};
