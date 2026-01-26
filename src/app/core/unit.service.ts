import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';
import { Observable } from 'rxjs';

export interface Unit {
  id: number;
  clientId: number;
  projectId?: number;
  serial: string;
  model: string;
  lat?: number;
  lng?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  constructor(private http: HttpClient) { }

  setNew(unit: Unit): Observable<Unit> {
    return this.http.post<Unit>(`${API_BASE_URL}/Units`, unit);
  }
  getAll(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${API_BASE_URL}/Units`);
  }
  getByProject(projectId: number): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${API_BASE_URL}/Units?projectId=${projectId}`);
  }
}
