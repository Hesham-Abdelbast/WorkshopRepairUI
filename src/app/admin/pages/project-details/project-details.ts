import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ResourceService } from '../../../core/resource.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-project-details',
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css'
})
export class ProjectDetails implements OnChanges {
  detailsTab: 'Overview' | 'Scopes' | 'Unit' | 'Tasks' | 'Reports' | 'Billing' | 'File' = 'Overview';

  @Input() taskss!: any;
  @Output() close = new EventEmitter<void>();

  units: any[] = [];
  projectTasks: any[] = [];
  reports: any[] = [];
  invoices: any[] = [];
  scopes: any[] = [];

  constructor(private resource: ResourceService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskss'] && this.taskss) {
      this.loadDataForTab(this.detailsTab);
    }
  }

  setTab(tab: 'Overview' | 'Scopes' | 'Unit' | 'Tasks' | 'Reports' | 'Billing' | 'File') {
    this.detailsTab = tab;
    this.loadDataForTab(tab);
  }

  loadDataForTab(tab: string) {
    if (!this.taskss || (!this.taskss.id && !this.taskss.Project)) return;
    const projectId = this.taskss.id;
    if (tab === 'Unit') {
      this.resource.getAll('Units', { projectId }).subscribe(data => this.units = data || []);
    } else if (tab === 'Tasks') {
      forkJoin({
        units: this.resource.getAll('Units', { projectId }).pipe(catchError(() => of([]))),
        tasks: this.resource.getAll('Tasks').pipe(catchError(() => of([])))
      }).subscribe(({ units, tasks }) => {
        const unitIds = (units || []).map((u: any) => u.id);
        this.projectTasks = (tasks || []).filter((t: any) => unitIds.includes(t.unitId));
      });
    } else if (tab === 'Billing') {
      this.resource.getAll('Invoices', {}).subscribe(data => this.invoices = data || []);
    } else if (tab === 'Reports') {
      this.resource.getAll('Reports', {}).subscribe(data => this.reports = data || []);
    } else if (tab === 'Scopes') {
      this.resource.getAll('Scopes', {}).subscribe({
        next: data => this.scopes = data || [],
        error: () => this.scopes = []
      });
    }
  }

  doClose() {
    this.close.emit();
  }
}
