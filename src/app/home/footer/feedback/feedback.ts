import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-feedback',
  standalone: false,
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class Feedback {
   showForm = false;
  submitted = false;

  feedback = {
    name: '',
    rating: '',
    message: ''
  };

  feedbackList: { name: string; rating: string; message: string }[] = [];

  ngOnInit(): void {
    const savedFeedback = localStorage.getItem('feedbackList');
    if (savedFeedback) {
      this.feedbackList = JSON.parse(savedFeedback);
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.submitted = false;
  }

  submitFeedback() {
    this.feedbackList.push({ ...this.feedback });
    localStorage.setItem('feedbackList', JSON.stringify(this.feedbackList));
    this.submitted = true;
    this.feedback = { name: '', rating: '', message: '' };

    setTimeout(() => {
      this.showForm = false;
    }, 2000);
  }

  clearFeedback() {
    localStorage.removeItem('feedbackList');
    this.feedbackList = [];
  }
}
