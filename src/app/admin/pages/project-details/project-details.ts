import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ResourceService } from '../../../core/resource.service';

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
    if (!this.taskss || !this.taskss.Project) return;
    
    // Assuming we can filter by ProjectName or ID. Using Project name as ID for now if ID is missing.
    const projectId = this.taskss.id || this.taskss.Project; 
    const params = { projectName: this.taskss.Project }; // or projectId

    if (tab === 'Unit' && this.units.length === 0) {
      this.resource.getAll('units', params).subscribe(data => this.units = data || []);
    } else if (tab === 'Tasks' && this.projectTasks.length === 0) {
      // Assuming 'tasks' endpoint exists or using 'Projects/tasks'
      // Using 'projects' itself might not be right for tasks inside a project. 
      // Maybe 'MaintenanceVisits' or specific 'Tasks' endpoint.
      // Let's assume 'MaintenanceVisits' are tasks.
      this.resource.getAll('MaintenanceVisits', params).subscribe(data => this.projectTasks = data || []);
    } else if (tab === 'Reports' && this.reports.length === 0) {
      this.resource.getAll('Reports', params).subscribe(data => this.reports = data || []);
    } else if (tab === 'Billing' && this.invoices.length === 0) {
      this.resource.getAll('invoices', params).subscribe(data => this.invoices = data || []);
    } else if (tab === 'Scopes' && this.scopes.length === 0) {
       // Scopes might be part of project or separate. assuming separate for now or mock.
       // If no endpoint, we might need to rely on project data or a new endpoint.
       // Let's try 'Scopes' endpoint
       this.resource.getAll('Scopes', params).subscribe({
         next: data => this.scopes = data || [],
         error: () => this.scopes = [] // Fallback
       });
    }
  }

  doClose() {
    this.close.emit();
  }
}
