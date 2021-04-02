import debug from 'debug';
import { ApplicationError } from '../helpers/errors';
import axios from 'axios';
import microsofComputerVision from 'microsoft-computer-vision';
const FormData = require('form-data');
const fs = require('fs');

const DEBUG = debug('dev');
const { DEEPL_KEY, MICROSOFT_KEY } = process.env;

const isLangSupported = (lang) => {
  const supportLang = ["DE", "EN", "FR", "ES", "IT", "JP", "NL", "PL", "PT", "RU", "ZH"]

  if (supportLang.indexOf(lang) < 0)
    return false;
  return true;
}
const getFile = (path) => {
  const bitmap = fs.readFileSync(path, {encoding:'utf8', flag:'r'});
  const buffer = Buffer.from(bitmap);

  console.log(bitmap);
  return bitmap;
}
const isDocReady = async (docId, docKey) => {

  const params = new FormData();
  params.append("auth_key", DEEPL_KEY);
  params.append("document_key", docKey);

  const formHeaders = formData.getHeaders();
  formHeaders['content-type'] = 'multipart/form-data;boundary="boundary"';

  const result = false;
  await axios.post(`https://api.deepl.com/v2/document/${docId}`, params, {
    headers: {
      ...formHeaders,
    },
  }).then((res) => {
    console.log(res);
    if (res.data.status === "done") {
      result = true;
    }
    return res.data;
  })
  return result;
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
  photoToText: async (req, res) => {

    try {
      const buff = Buffer.from(req.body.photo, 'base64');

      const image = buff.toString('utf-8');

      microsofComputerVision.orcImage({
        "Ocp-Apim-Subscription-Key": "8d9ad40c858c4e26bfed72ef80c57640",
        "request-origin": "westeurope",
        "language": req.body.sourceLang.toLowerCase(),
        "detect-orientation": true,
        "content-type": "application/octet-stream",
        "body": buff
      }).then((result) => {
        let resultString = "";

        for (let region of result.regions) {
          for (let line of region.lines) {
            for (let word of line.words) {
              resultString += word.text + " ";
            }
            resultString += ". ";
          }
        }
        return res.status(200).json({
          status: 'success',
          data: {
            text: resultString
          }
        })
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
  translateDocument: async (req, res) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      const params = new URLSearchParams();
      params.append("auth_key", DEEPL_KEY);
      params.append("source_lang", req.body.source_lang);
      params.append("target_lang", req.body.target_lang);
      params.append("text", getFile(process.cwd() + "/uploads/" + req.files[0].filename, req.files[0].filename));

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
};
