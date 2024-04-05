import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
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
export class AppComponent implements OnInit {
  todos: WritableSignal<Todo[]> = signal([]);

  private appService = inject(AppService);

  ngOnInit(): void {
    this.appService.getTodos().subscribe((todos) => {
      this.todos.set(todos);
    });
  }

  update(todo: Todo) {
    this.appService.updateTodo(todo).subscribe((todoUpdated: Todo) => {
      this.todos.update((todos) =>
        todos.map((t) => (t.id === todoUpdated.id ? todoUpdated : t)),
      );
    });
  }

  delete(todo: Todo) {
    this.appService.deleteTodo(todo).subscribe(() => {
      this.todos.update((todos) => todos.filter((t) => t.id !== todo.id));
    });
  }
}
