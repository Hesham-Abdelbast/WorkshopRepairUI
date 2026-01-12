import { SharedPageHeader } from './../../shared-layout/shared-page-header/shared-page-header';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResourceService } from '../../../core/resource.service';

@Component({
  selector: 'app-shared-inventory',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass, SharedPageHeader],
  templateUrl: './shared-inventory.html',
  styleUrl: './shared-inventory.css'
})
export class SharedInventory {
  @Input() role: 'admin' | 'dispatcher' | 'manager' | 'technician' | 'client' | null = null;

  allSelected = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
    });
    this.loadTasks();
  }
  tasks: any[] = [];
  loadTasks() {
    const params: Record<string, string> = {};
    if (this.role) params['role'] = this.role;
    this.resource.getAll('Inventory', params).subscribe({
      next: (items: any) => {
        this.tasks = (items || []).map((t: any, i: number) => ({
          selected: false,
          Code: t.code || `#P ${i + 1}`,
          ProjectName: t.partName || t.projectName || `Project ${i + 1}`,
          TechnicalName: t.user || t.lastUser || '',
          UnitType: t.unitType || '',
          Location: t.location || '',
          IssueDescription: t.issuedDate || '',
          SuggestedRepair: t.unitCost ? `${t.unitCost} USD` : '',
          Priority: t.status || 'In-Stock'
        }));
      },
      error: () => {
        if (this.role === 'admin' || this.role === 'manager' || this.role === 'dispatcher') {
          this.tasks = Array.from({ length: 30 }).map((_, i) => ({
            selected: false,
            Code: `#P ${i + 1}`,
            ProjectName: `Project ${i + 1}`,
            TechnicalName: i % 2 === 0 ? 'Mustafa Adel' : 'Salah Hassan',
            UnitType: i % 2 === 0 ? 'Elevator' : 'HVAC',
            Location: i % 2 === 0 ? 'Cairo' : 'Alexandria',
            IssueDescription: i % 2 === 0 ? 'Jun 24,2022-1405' : 'Jun 24,2022-1405',
            SuggestedRepair: '2314 USD',
            Priority: i % 2 === 0 ? 'Critical' : 'Hight',
          }));
        } else {
          this.tasks = Array.from({ length: 15 }).map((_, i) => ({
            selected: false,
            Code: `#P ${i + 1}`,
            ProjectName: `Project ${i + 1}`,
            UnitType: i % 2 === 0 ? 'Elevator' : 'HVAC',
            Location: i % 2 === 0 ? 'Cairo' : 'Alexandria',
            IssueDescription: i % 2 === 0 ? 'Jun 24,2022-1405' : 'Jun 24,2022-1405',
            SuggestedRepair: '2314 USD',
            Priority: i % 2 === 0 ? 'Critical' : 'Hight',
          }));
        }
      }
    });
  }
  // بيانات تجريبية

  toggleAll() {
    this.pagedTasks.forEach(t => t.selected = this.allSelected);
  }

  updateAllSelected() {
    this.allSelected = this.pagedTasks.length > 0 && this.pagedTasks.every(t => t.selected);
  }

  // Pagination
  page = 1;
  pageSize = 10;

  get pagedTasks() {
    const start = (this.page - 1) * this.pageSize;
    return this.tasks.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.tasks.length / this.pageSize);
  }

  // الصفحات اللي هتظهر في الـ pagination
  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxButtons = 5;

    if (this.totalPages <= maxButtons) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let start = this.page - Math.floor(maxButtons / 2);
      let end = this.page + Math.floor(maxButtons / 2);

      if (start < 1) {
        start = 1;
        end = maxButtons;
      }
      if (end > this.totalPages) {
        end = this.totalPages;
        start = this.totalPages - maxButtons + 1;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.page = p;
  }

  // Details Panel
  showDetails = false;
  selectedTask: any = null;

  openDetails(task: any) {
    this.selectedTask = { ...task }; // Clone to avoid direct mutation
    this.showDetails = true;
    document.body.style.overflow = 'hidden';
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedTask = null;
    document.body.style.overflow = 'auto';
  }

  updateTask(task: any) {
    // Implement update logic
    const index = this.tasks.findIndex(t => t.Code === task.Code);
    if (index !== -1) {
      this.tasks[index] = { ...task };
      // Backend update
      // Assuming 'Inventory' endpoint supports update by ID (using Code as ID or needing real ID)
      // If backend uses specific ID field, we should ensure it's mapped.
      // For now assuming Code is the identifier or we pass the whole object.
      this.resource.update('Inventory', task.Code, task).subscribe({
        next: () => console.log('Inventory updated'),
        error: (err) => console.error('Failed to update inventory', err)
      });
    }
    this.closeDetails();
  }

  // Create Inventory
  showCreateModal = false;

  openCreate() {
    this.showCreateModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCreate() {
    this.showCreateModal = false;
    document.body.style.overflow = 'auto';
  }

  saveNewInventory(data: any) {
    const payload = {
      code: data.Code || `INV-${Math.floor(Math.random() * 1000)}`,
      projectName: data.ProjectName,
      unitType: data.UnitType,
      location: data.Location,
      qtyOnHand: data.QtyOnHand || 0,
      minQty: data.MinQty || 0,
      unitCost: data.UnitCost || 0,
      status: data.Status || 'In-Stock'
    };

    this.resource.create('Inventory', payload).subscribe({
      next: (created) => {
        const newItem = {
          selected: false,
          Code: created.code || payload.code,
          ProjectName: created.projectName || payload.projectName,
          TechnicalName: created.user || 'Admin', // Default or from context
          UnitType: created.unitType || payload.unitType,
          Location: created.location || payload.location,
          IssueDescription: new Date().toLocaleDateString(), // Today's date as issue date
          SuggestedRepair: created.unitCost ? `${created.unitCost} USD` : `${payload.unitCost} USD`,
          Priority: created.status || payload.status
        };
        this.tasks.unshift(newItem);
        this.closeCreate();
      },
      error: (err) => {
        console.error('Failed to create inventory item', err);
        // Fallback
        const newItem = {
          selected: false,
          Code: payload.code,
          ProjectName: payload.projectName,
          TechnicalName: 'Admin',
          UnitType: payload.unitType,
          Location: payload.location,
          IssueDescription: new Date().toLocaleDateString(),
          SuggestedRepair: `${payload.unitCost} USD`,
          Priority: payload.status
        };
        this.tasks.unshift(newItem);
        this.closeCreate();
      }
    });
  }

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private resource: ResourceService
  ) {

  }


  // اللون في ال Priority
  getPriorityClass(index: number): string {
    const colors = ['yellow-pill', 'green-pill', 'blue-pill']; // 3 ألوان
    return colors[index % colors.length]; // يبدل الألوان بالتناوب
  }


}

