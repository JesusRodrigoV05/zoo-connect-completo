import { ZooWeather } from "../models/weather.model";
import { WEATHER_TRANSLATIONS } from "./weather-dictionary";

export const weatherAdapter = (apiResponse: any): ZooWeather => {
  const originalText = apiResponse.current.condition.text;

  const translatedText =
    WEATHER_TRANSLATIONS[originalText.trim().toLowerCase()] || originalText;

  const zooTips = getZooMessage(apiResponse.current.temp_c, translatedText);

  return {
    ...apiResponse,
    current: {
      ...apiResponse.current,
      condition: {
        ...apiResponse.current.condition,
        text: translatedText,
      },
    },
    ui: {
      message: zooTips.message,
      messageType: zooTips.type,
    },
  };
};

export const getZooMessage = (
  temp: number,
  conditionText: string,
): { message: string; type: "good" | "warning" | "info" } => {
  const text = conditionText.toLowerCase();

  if (
    text.includes("tormenta") ||
    text.includes("truenos") ||
    text.includes("granizo")
  ) {
    return {
      message:
        "Clima inestable. Te recomendamos visitar nuestras áreas cubiertas como el Acuario.",
      type: "warning",
    };
  }

  if (text.includes("lluvia") || text.includes("aguacero")) {
    return {
      message:
        "¡Día de aventuras bajo techo! El Reptilario y el Museo son perfectos para hoy.",
      type: "info",
    };
  }

  if (text.includes("llovizna") || text.includes("chubasco")) {
    return {
      message:
        "Una lluvia ligera no detiene la diversión. ¡Trae tu paraguas y disfruta el frescor!",
      type: "info",
    };
  }

  if (temp >= 32) {
    return {
      message:
        "¡Calor intenso! Mantente hidratado y busca la sombra en el Bosque de los Monos.",
      type: "warning",
    };
  }

  if (temp <= 5) {
    return {
      message:
        "¡Hace mucho frío! Los Osos Andinos están felices, pero tú abrígate bien.",
      type: "info",
    };
  }

  if (text.includes("viento") || text.includes("ventoso")) {
    return {
      message:
        "¡Día ventoso! El Aviario puede estar más tranquilo hoy, pero es ideal para caminar.",
      type: "info",
    };
  }

  if (text.includes("niebla") || text.includes("neblina")) {
    return {
      message:
        "¡Ambiente místico! La selva se ve increíble con niebla. Prepara tu cámara.",
      type: "good",
    };
  }

  if (text.includes("nublado") || text.includes("cubierto")) {
    return {
      message:
        "Cielo nublado. Perfecto para recorrer todo el zoo sin cansarte por el sol.",
      type: "good",
    };
  }

  if (temp >= 25) {
    return {
      message:
        "Día radiante. ¡Es el momento perfecto para ver a los Capibaras nadando!",
      type: "good",
    };
  }

  if (temp >= 10 && temp < 18) {
    return {
      message:
        "Clima fresco. Los felinos suelen estar más activos con esta temperatura.",
      type: "good",
    };
  }

  return {
    message:
      "¡El clima es perfecto! Es un gran día para explorar cada rincón del refugio.",
    type: "good",
  };
};
