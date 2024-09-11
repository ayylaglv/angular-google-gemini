import { Component, inject } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  userInput: string = '';
  geminiService: GeminiService = inject(GeminiService);
  chatHistory: any[] = [];
  loading: boolean = false;
  // Simulating an AI response
  constructor() {
    this.geminiService.getMessageHistory().subscribe((res) => {
      if (res) {
        this.chatHistory.push(res);
      }
    });
  }

  ngOnInit() {}

  async sendMessage() {
    if (this.userInput) {
      this.loading = true;
      const data = this.userInput;
      this.userInput = '';
      await this.geminiService.generateText(data);
      this.loading = false;
    }
  }

  formatText(text: string) {
    const result = text.replaceAll('*', '');
    return result;
  }
  // Method to simulate random AI responses
}
