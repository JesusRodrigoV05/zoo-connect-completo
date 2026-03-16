interface Condition {
  text: string;
  icon: string;
}

interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface Current {
  temp_c: number;
  condition: Condition;
  humidity: number;
  feelslike_c: number;
  uv: number;
}

export interface Weather {
  location: Location;
  current: Current;
}

export interface ZooWeather extends Weather {
  ui: {
    message: string;
    messageType: "good" | "warning" | "info";
  };
}
