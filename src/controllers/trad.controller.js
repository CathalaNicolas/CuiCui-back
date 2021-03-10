import debug from 'debug';
import { ApplicationError } from '../helpers/errors';
import axios from 'axios';

const DEBUG = debug('dev');
const { DEEPL_KEY, GOOGLE_ID } = process.env;

const isLangSupported = (lang) => {
  const supportLang = ["DE", "EN", "FR", "ES", "IT", "JP", "NL", "PL", "PT", "RU", "ZH"]

  if (supportLang.indexOf(lang) < 0)
    return false;
  return true;
}

export default {
  translateText: async (req, res) => {

    try {
      if (isLangSupported(req.body.targetLang) === false || isLangSupported(req.body.sourceLang) === false)
        return res.status(400).json({
          status: 'error',
          error: {
            message: "Language not supported"
          },
        });
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }

      const params = new URLSearchParams();
      params.append("auth_key", DEEPL_KEY);
      params.append("source_lang", req.body.sourceLang);
      params.append("target_lang", req.body.targetLang);
      params.append("text", req.body.text);

      const response = await axios.post('https://api.deepl.com/v2/translate', params, config);

      return res.status(200).json({
        status: 'success',
        data: {
          text: response.data.translations[0].text
        }
      })
    } catch (error) {
      DEBUG(error);
      throw new ApplicationError(500, error);
    }
  },
  voiceToText: async (req, res) => {

    try {
      if (isLangSupported(req.body.sourceLang) === false)
        return res.status(400).json({
          status: 'error',
          error: {
            message: "Language not supported"
          },
        });

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }

      const params = new URLSearchParams();
      params.append("auth_key", GOOGLE_ID);
      params.append("source_lang", req.body.sourceLang);
      params.append("voice", req.body.voice);

      const response = await axios.post('https://westeurope.cloud.api.google.com/speech/recognition/conversation/cognitiveservices/v1', params, config);

      return res.status(200).json({
        status: 'success',
        data: {
          text: response.data.translations[0].voice
        }
      })
    } catch (error) {
      DEBUG(error);
      throw new ApplicationError(500, error);
    }
  },
};
