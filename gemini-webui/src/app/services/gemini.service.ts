import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileConversionService } from './file-conversion.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private messageHistory: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(private fileConversionService: FileConversionService) {}

  generativeAI: GoogleGenerativeAI = new GoogleGenerativeAI(
    environment.API_KEY
  );
  generationConfig = {
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
    temperature: 0.9,
    top_p: 1,
    top_k: 32,
    maxOutputTokens: 10000, // limit output
  };

  model = this.generativeAI.getGenerativeModel({
    model: 'gemini-pro',
    ...this.generationConfig,
  });

  async generateText(prompt: string) {
    this.messageHistory.next({
      sender: 'user',
      message: prompt,
    });

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    if (response.candidates?.length) {
      const text = response?.candidates[0].content.parts[0].text;
      console.log(text);
      this.messageHistory.next({
        sender: 'bot',
        message: text,
      });
    }
  }

  async testGeminiProVisionImages() {
    try {
      let imageBase64 = await this.fileConversionService.convertToBase64(
        'assets/elephants.jpeg'
      );

      // Check for successful conversion to Base64
      if (typeof imageBase64 !== 'string') {
        console.error('Image conversion to Base64 failed.');
        return;
      }
      // Model initialisation missing for brevity
      let prompt = [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: 'Provide a recipe.',
        },
      ];
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      console.log(response.text());
    } catch (error) {
      console.error('Error converting file to Base64', error);
    }
  }

  public getMessageHistory(): Observable<any> {
    return this.messageHistory.asObservable();
  }
}
