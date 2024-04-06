import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AppService } from './app.service';

export interface Todo {
  id: number;
  title: string;
  body: string;
  userId: number;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-root',
  template: `
    <div *ngFor="let todo of todos()">
      {{ todo.title }}
      <button (click)="update(todo)">Update</button>
      <button (click)="delete(todo)">Delete</button>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  private appService = inject(AppService);
  todos = this.appService.todos;

  ngOnInit(): void {
    this.appService.todoList$.subscribe();
  }

  update(todo: Todo) {
    this.appService.todoUpdatedSubject$$.next(todo);
  }

  delete(todo: Todo) {
    this.appService.todoDeletedSubject$$.next(todo);
  }
}
