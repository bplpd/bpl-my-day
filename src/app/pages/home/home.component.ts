import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { Todo } from '../../models/todo.model';

interface Day {
  date: Date;
  day: string;
  todos: Todo[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  title = 'My Week';
  currentWeek: Day[] = [];
  selectedDate: Date = new Date();
  todos: Todo[] = [];
  todosApi: any;

  constructor(private apiService: ApiService) {
    this.todosApi = this.apiService.collection('todos');
  }

  ngOnInit() {
    this.loadCurrentWeek();
    this.loadTodos();
  }

  loadCurrentWeek() {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());

    this.currentWeek = [];
    for (let date = start; date <= end; date = addDays(date, 1)) {
      this.currentWeek.push({
        date: new Date(date),
        day: format(date, 'EEEE'),
        todos: [],
      });
    }
  }

  async loadTodos() {
    try {
      this.todos = await this.todosApi.get();
      // Group todos by date
      this.currentWeek.forEach((day) => {
        day.todos = this.todos.filter(
          (todo) => todo.date && isSameDay(new Date(todo.date), day.date),
        );
      });
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  }

  async addTodo(day: any, todoText: string) {
    if (!todoText.trim()) return;

    try {
      await this.todosApi.create({
        text: todoText,
        date: format(day.date, 'yyyy-MM-dd'),
        completed: false,
      });
      await this.loadTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  async toggleTodo(todo: Todo) {
    try {
      await this.todosApi.update(todo.id!, {
        completed: !todo.completed,
      });
      await this.loadTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  }

  async deleteTodo(todo: Todo) {
    try {
      await this.todosApi.delete(todo.id!);
      await this.loadTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }
}
