import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Injectable,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { randText } from '@ngneat/falso';
import {
  Subject,
  catchError,
  map,
  merge,
  startWith,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Todo } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private todosUrl = 'https://jsonplaceholder.typicode.com/todos';
  private http = inject(HttpClient);

  todoUpdatedSubject$$ = new Subject<Todo>();
  todoDeletedSubject$$ = new Subject<Todo>();

  todos: WritableSignal<Todo[]> = signal([]);
  todosSignal: Signal<Todo[]> = computed(() => this.todos());

  readonly todos$ = this.http.get<Todo[]>(`${this.todosUrl}`).pipe(
    tap((todos) => this.todos.set(todos)),
    catchError(this.handleError),
  );

  private todoUpdated$ = this.todoUpdatedSubject$$.pipe(
    switchMap((todo) => this.updateTodo(todo)),
  );

  private todoDeleted$ = this.todoDeletedSubject$$.pipe(
    switchMap((todo) => this.deleteTodo(todo)),
  );

  todoEvents$ = merge(this.todos$, this.todoUpdated$, this.todoDeleted$);

  todoList$ = this.todoEvents$.pipe(
    startWith(null),
    tap(() => console.log('Here is where I would refetch the todos')),
  );

  updateTodo(updateTodo: Todo) {
    return this.http
      .put<Todo>(
        `${this.todosUrl}/${updateTodo.id}`,
        JSON.stringify({
          todo: updateTodo.id,
          title: randText(),
          body: updateTodo.body,
          userId: updateTodo.userId,
        }),
        {
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        },
      )
      .pipe(
        map((todo) => todo),
        tap((updateTodo) => {
          this.todos.update((todos) =>
            todos.map((t) => (t.id === updateTodo.id ? updateTodo : t)),
          );
        }, catchError(this.handleError)),
      );
  }

  deleteTodo(deletedTodo: Todo) {
    return this.http.delete(`${this.todosUrl}/${deletedTodo.id}`).pipe(
      tap(() => {
        this.todos.update((todos) =>
          todos.filter((t) => t.id !== deletedTodo.id),
        );
      }, catchError(this.handleError)),
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error,
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(
      () => new Error('Something bad happened; please try again later.'),
    );
  }
}
