export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

import axios from "axios";

export const translateText = async (text, sourceLang, targetLang) => {
  try {
    const res = await axios.post("https://libretranslate.de/translate", {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: "text",
    });
    return res.data.translatedText;
  } catch (error) {
    console.error("Translation error:", error.message);
    return text; 
  }
};
