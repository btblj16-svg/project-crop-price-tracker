export interface Crop {
  id: number;
  name: string;
  tamil_name?: string;
  category?: string;
}

export interface Market {
  id: number;
  name: string;
  district?: string;
  state?: string;
}

export interface CropPrice {
  id: number;
  crop_id: number;
  market_id: number;
  crop_name?: string;
  crop_tamil_name?: string;
  market_name?: string;
  market_district?: string;
  variety?: string;
  date: string;
  min_price?: number;
  max_price?: number;
  modal_price?: number;
  arrival_quantity?: number;
}

export interface ModelMetric {
  mae: number;
  rmse: number;
  mape: number;
  smape: number;
  r2: number;
}

export interface ForecastPoint {
  date: string;
  predicted_price: number;
}

export interface ModelForecast {
  model_name: string;
  metrics: ModelMetric;
  forecast: ForecastPoint[];
}

export interface DynamicForecastResponse {
  crop_id: number;
  crop_name: string;
  crop_tamil_name?: string;
  market_id: number;
  market_name: string;
  models: {
    [key: string]: ModelForecast;
  };
}

export interface WeatherData {
  id: number;
  market_id: number;
  market_name?: string;
  district?: string;
  date: string;
  temperature?: number;
  rainfall?: number;
  humidity?: number;
  condition?: string;
}

export interface PriceAlert {
  id: number;
  crop_name: string;
  market_name: string;
  threshold_price: number;
  direction: 'above' | 'below';
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_crops: number;
  total_markets: number;
  average_modal_price: number;
  active_alerts_count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_prices: CropPrice[];
  recent_weather: WeatherData[];
  recent_predictions: any[];
  alerts: PriceAlert[];
}
