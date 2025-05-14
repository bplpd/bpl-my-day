import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('http://192.168.178.21:8090');
  }

  collection(collectionName: string) {
    return {
      // Basic CRUD operations
      create: async (data: any) => {
        try {
          return await this.pb.collection(collectionName).create(data);
        } catch (error) {
          return this.handleError(error);
        }
      },

      get: async (id: string) => {
        try {
          return await this.pb.collection(collectionName).getOne(id);
        } catch (error) {
          return this.handleError(error);
        }
      },

      list: async (options?: {
        filter?: string;
        sort?: string;
        page?: number;
        perPage?: number;
      }) => {
        try {
          return await this.pb
            .collection(collectionName)
            .getList(options?.page || 1, options?.perPage || 30, {
              filter: options?.filter,
              sort: options?.sort,
            });
        } catch (error) {
          return this.handleError(error);
        }
      },

      update: async (id: string, data: any) => {
        try {
          return await this.pb.collection(collectionName).update(id, data);
        } catch (error) {
          return this.handleError(error);
        }
      },

      delete: async (id: string) => {
        try {
          return await this.pb.collection(collectionName).delete(id);
        } catch (error) {
          return this.handleError(error);
        }
      },

      // Realtime subscriptions
      subscribe: (callback: Function) => {
        return this.pb.collection(collectionName).subscribe('*', (e) => {
          callback(e);
        });
      },
    };
  }

  // Authentication methods
  auth = {
    login: async (email: string, password: string) => {
      return this.pb.collection('users').authWithPassword(email, password);
    },

    logout: () => {
      this.pb.authStore.clear();
    },

    currentUser: () => {
      return this.pb.authStore.record;
    },
  };

  private handleError(error: any) {
    console.error('PocketBase Error:', error);
    // Add error handling logic here
    throw error;
  }
}
