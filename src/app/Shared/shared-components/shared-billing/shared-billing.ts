import { SharedPageHeader } from './../../shared-layout/shared-page-header/shared-page-header';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateNewBilling } from '../../../admin/pages/create-new-billing/create-new-billing';
import { ResourceService } from '../../../core/resource.service';
interface Invoice {
  selected: boolean;
  Invoice: string;
  Client: string;
  Date: string;         // date string
  Due: string;
  Amount: number;
  Balance: number;
  Status?: 'Unpaid' | 'Paid' | 'Partially Paid' | string;
  photos?: string[];
}
@Component({
  selector: 'app-shared-billing',
  imports: [NgFor, NgIf, FormsModule, CreateNewBilling, NgClass, SharedPageHeader],
  standalone: true,
  templateUrl: './shared-billing.html',
  styleUrl: './shared-billing.css'
})
export class SharedBilling {

  // UI state
  showFilterBuilder = false;
  // ضيفت ال data من والي 
  newFilter = { field: '', value: '', dateFrom: '', dateTo: '' };
  activeFilters: { field: string; value: string; dateFrom?: string; dateTo?: string }[] = [];
  // details panel
  showDetails = false;
  selectedTask: Invoice | null = null;

  // Selection
  allSelected = false;
  //  search text
  searchText: string = '';

  // Pagination
  page = 1;
  pageSize = 10;
  statuses = [
    'Partially Paid',
    'Paid',
    'Unpaid',
  ];
  @Input() role: 'admin' | 'finance' | 'manager' | null = null;

  tasks: Invoice[] = [];
  ngOnInit(): void {
    this.loadTasks();
  }

  constructor(private resourceService: ResourceService) { }
  loadTasks() {
    const params: any = {};
    if (this.role) {
      params.role = this.role;
    }
    this.resourceService.getAll('invoices', params).subscribe({
      next: (data: any[]) => {
        this.tasks = data.map(item => ({
          selected: false,
          Invoice: item.invoiceNumber || item.Invoice || 'INV-0000',
          Client: item.clientName || item.Client || 'Unknown Client',
          Date: item.issueDate || item.Date || '',
          Due: item.dueDate || item.Due || '',
          Amount: item.amount || item.Amount || 0,
          Balance: item.balance || item.Balance || 0,
          Status: item.status || item.Status || 'Unpaid',
          photos: item.photos || []
        }));
      },
      error: (err) => {
        console.error('Failed to load invoices, using mock data', err);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    if (this.role == 'admin' || 'manager') {
      this.tasks = [
        {
          selected: false,
          Invoice: 'INV-1001',
          Client: 'EU Embassy',
          Date: '2025-10-12',
          Due: '2025-10-30',
          Amount: 12400.00,
          Balance: 600000,
          Status: 'Partially Paid',
          photos: ['assets/images/p2.png', 'assets/images/p3.png', 'assets/images/p4.jpg',
            'assets/images/p1.jpg', 'assets/images/p5.jpg'
          ]
        },
        {
          selected: false,
          Invoice: 'INV-1002',
          Client: 'Carlton Hotel – Damascus',
          Date: '2025-10-15',
          Due: '2025-10-25',
          Amount: 4200.00,
          Balance: 1240000,
          Status: 'Paid',
          photos: ['assets/images/p2.png', 'assets/images/p3.png', 'assets/images/p4.jpg',
          ]
        },
        {
          selected: false,
          Invoice: 'INV-1003',
          Client: 'Al Badya Cement',
          Date: '2025-10-10',
          Due: '2025-10-20',
          Amount: 3840.00,
          Balance: 0.00,
          Status: 'Unpaid',
          photos: ['assets/images/p2.png', 'assets/images/p3.png', 'assets/images/p4.jpg',
            'assets/images/p1.jpg', 'assets/images/p5.jpg'
          ]
        },
        {
          selected: false,
          Invoice: 'INV-1004',
          Client: 'Park Residence',
          Date: '2025-10-18',
          Due: '2025-10-28',
          Amount: 1020.00,
          Balance: 500000,
          Status: 'Partially Paid',
          photos: ['assets/images/p2.png', 'assets/images/p3.png', 'assets/images/p4.jpg',
            'assets/images/p1.jpg', 'assets/images/p5.jpg'
          ]
        },
      ]
    }
    else if (this.role == 'finance') {
      this.tasks = [
        {
          selected: false,
          Invoice: 'INV-1001',
          Client: 'EU Embassy',
          Date: '2025-10-12',
          Due: '2025-10-30',
          Amount: 12400.00,
          Balance: 600000,
          Status: 'Partially Paid',
          photos: ['assets/images/p2.png', 'assets/images/p3.png', 'assets/images/p4.jpg',
            'assets/images/p1.jpg', 'assets/images/p5.jpg'
          ]
        },
        {
          selected: false,
          Invoice: 'INV-1002',
          Client: 'Carlton Hotel – Damascus',
          Date: '2025-10-15',
          Due: '2025-10-25',
          Amount: 4200.00,
          Balance: 1240000,
          Status: 'Paid',
          photos: ['assets/images/p2.png', 'assets/images/p3.png', 'assets/images/p4.jpg',
          ]
        },]
    }
  }




  //لاحظ اني حطات قيمتها في ال applayDetails
  mainImage: string = '';
  setMainImage(photoPath: string) {
    this.mainImage = photoPath;
  }
  selectedCount = 0;
  // ---------------- selection ----------------
  toggleAll() {
    this.pagedTasks.forEach(t => (t.selected = this.allSelected));
    this.selectedCount = this.pagedTasks.filter(t => t.selected).length;
  }
  numberOfSelcted: number = 0;
  updateAllSelected() {
    // update global checkbox according to visible (paged) items
    this.allSelected =
      this.pagedTasks.length > 0 &&
      this.pagedTasks.every(t => t.selected);
    // بظبط عدد المحددين
    this.selectedCount = this.pagedTasks.filter(t => t.selected).length;
  }

  // ---------------- pagination / filtered list getters ----------------
  get filteredTasks(): Invoice[] {
    console.log("Mustafa Adel");

    let result = this.tasks;

    if (this.activeFilters.length) {
      result = result.filter(task =>
        this.activeFilters.every(f => {
          const v = (task as any)[f.field];
          if (v == null) return false;

          console.log(f.field);
          // ✅ لو الفلتر تاريخ
          if (f.field === 'Date') {
            const taskDate = new Date(task.Date);
            const from = f.dateFrom ? new Date(f.dateFrom) : null;
            const to = f.dateTo ? new Date(f.dateTo) : null;
            if (from && taskDate < from) return false;
            if (to && taskDate > to) return false;
            return true;
          }
          else if (f.field === 'Due') {
            const taskDate = new Date(task.Due);
            const from = f.dateFrom ? new Date(f.dateFrom) : null;
            const to = f.dateTo ? new Date(f.dateTo) : null;
            if (from && taskDate < from) return false;
            if (to && taskDate > to) return false;
            return true;
          }

          // باقي الفلاتر العادية
          return String(v).toLowerCase() === String(f.value).toLowerCase();
        })
      );
    }

    // 🔹 فلترة البحث
    if (this.searchText.trim() !== '') {
      const search = this.searchText.toLowerCase();
      result = result.filter(task => task.Invoice.toLowerCase().includes(search));
    }

    return result;
  }



  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTasks.length / this.pageSize));
  }

  get pagedTasks(): Invoice[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredTasks.slice(start, start + this.pageSize);
  }

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

  // ---------------- filter builder ----------------
  toggleFilterBuilder() {
    this.showFilterBuilder = !this.showFilterBuilder;
    // reset newFilter
    this.newFilter = { field: '', value: '', dateFrom: '', dateTo: '' };
  }

  getFilterValues(field: string): string[] {
    if (!field) return [];
    const values = this.tasks
      .map(t => (t as any)[field])
      .filter(v => v !== undefined && v !== null)
      .map(v => String(v));
    return Array.from(new Set(values));
  }

  applyFilter() {
    if (!this.newFilter.field) return;

    if (this.newFilter.field === 'Date') {
      if (!this.newFilter.dateFrom && !this.newFilter.dateTo) return;
      this.activeFilters.push({
        field: 'Date',
        value: `${this.newFilter.dateFrom || '...'} → ${this.newFilter.dateTo || '...'}`,
        dateFrom: this.newFilter.dateFrom,
        dateTo: this.newFilter.dateTo
      });
    }
    else if (this.newFilter.field === 'Due') {
      if (!this.newFilter.dateFrom && !this.newFilter.dateTo) return;
      this.activeFilters.push({
        field: 'Due',
        value: `${this.newFilter.dateFrom || '...'} → ${this.newFilter.dateTo || '...'}`,
        dateFrom: this.newFilter.dateFrom,
        dateTo: this.newFilter.dateTo
      });
    }
    else if (this.newFilter.value) {
      this.activeFilters.push({ ...this.newFilter });
    }

    this.newFilter = { field: '', value: '', dateFrom: '', dateTo: '' };
    this.showFilterBuilder = false;
    this.page = 1;
  }


  removeFilter(idx: number) {
    this.activeFilters.splice(idx, 1);
    // keep page valid
    if (this.page > this.totalPages) this.page = this.totalPages;
  }

  clearAllFilters() {
    this.activeFilters = [];
    this.page = 1;
  }

  // ---------------- actions ----------------
  performAction(task: Invoice, action: string) {
    if (action === 'view') {
      this.openDetails(task);
    } else if (action === 'delete') {
      if (!confirm(`Delete ${task.Invoice}?`)) return;
      // حذف من المصدر
      const idx = this.tasks.indexOf(task);
      if (idx >= 0) this.tasks.splice(idx, 1);
      // adjust pagination if needed
      if (this.page > this.totalPages) this.page = this.totalPages;
    }
  }

  onSelectChange(task: any, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    this.performAction(task, value);
  }


  // ---------------- details panel ----------------
  openDetails(task: Invoice) {
    //بحيط القيمه في ال main image عشان ال Details يشتغل صح
    if (task.photos && task.photos.length > 0) {
      this.mainImage = task.photos[0];
    }
    this.selectedTask = task;
    this.showDetails = true;
    // scroll to top so details visible (optional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden'; // يمنع scroll الصفحة

  }

  closeDetails() {
    this.selectedTask = null;
    this.showDetails = false;
    document.body.style.overflow = 'auto'; // يرجع scroll الصفحة

  }
  getSortedStatuses(current: any) {
    // الحالة الحالية تبقى أول وحدة
    return [current, ...this.statuses.filter(s => s !== current)];
  }

  updateTaskStatus(task: any) {
    const index = this.tasks.findIndex(t => t.Invoice === task.Invoice);
    if (index !== -1) {
      this.tasks[index].Status = task.Status;
      // Persist to backend
      const payload = { status: task.Status };
      // Assuming 'invoices' endpoint supports update by ID or similar. 
      // If we need ID, we might need to store it. Assuming Invoice Number is unique or we have ID.
      // If we don't have ID, we use Invoice number as ID for now.
      const id = task.id || task.Invoice; 
      this.resourceService.update('invoices', id, payload).subscribe({
        next: () => console.log('Invoice status updated'),
        error: (err) => console.error('Failed to update invoice status', err)
      });
    }
  }
  forceDatePicker(event: Event) {
    const target = event.target as HTMLInputElement;
    // التأكد أن الدالة موجودة قبل استدعائها
    if (target.showPicker) {
      target.showPicker();
    }
  }


  //create new visit modal logic

  showCreate = false;

  openCreate() {
    this.showCreate = true;
    // ارفع الصفحة لفوق عشان يبان المودال فوق الكل
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden'; // يمنع scroll الصفحة

  }
  closeCreate() {
    this.showCreate = false;

    document.body.style.overflow = 'auto'; // يرجع scroll الصفحة

  }


  addTask(newInvoiceData: any) {
    const payload = {
      invoiceNumber: newInvoiceData.Invoice || `INV-${Math.floor(Math.random() * 10000)}`,
      clientName: newInvoiceData.Client,
      projectName: newInvoiceData.Project, // Assuming Project is part of input if needed, or mapped
      issueDate: newInvoiceData.Date,
      dueDate: newInvoiceData.Due,
      amount: newInvoiceData.Amount || 0,
      balance: newInvoiceData.Balance || 0,
      status: 'Pending',
      photos: []
    };

    this.resourceService.create('invoices', payload).subscribe({
      next: (created) => {
        const newInvoice: Invoice = {
          selected: false,
          Invoice: created.invoiceNumber || payload.invoiceNumber,
          Client: created.clientName || payload.clientName,
          Date: created.issueDate || payload.issueDate,
          Due: created.dueDate || payload.dueDate,
          Amount: created.amount || payload.amount,
          Balance: created.balance || payload.balance,
          Status: created.status || 'Pending',
          photos: created.photos || []
        };
        this.tasks.unshift(newInvoice);
        this.page = 1;
        this.showCreate = false;
        document.body.style.overflow = 'auto';
      },
      error: (err) => {
        console.error('Failed to create invoice', err);
        // Fallback
        const newInvoice: Invoice = {
          selected: false,
          Invoice: payload.invoiceNumber,
          Client: payload.clientName,
          Date: payload.issueDate,
          Due: payload.dueDate,
          Amount: payload.amount,
          Balance: payload.balance,
          Status: 'Pending',
          photos: []
        };
        this.tasks.unshift(newInvoice);
        this.page = 1;
        this.showCreate = false;
        document.body.style.overflow = 'auto';
      }
    });
  }

  getStatusCount(status: string): number {
    let count: number = 0;
    if (status == 'total') {
      //هنا انا عملتها علي كله بس عايز اظبطها علي تاريخ الشهر الي الحالي فقط 
      this.tasks.forEach(element => {
        count += element.Amount;
      });
    }
    else {
      this.tasks.forEach(element => {
        if (element.Status === status) {
          count += element.Amount;
        }
      });
    }
    return count;
  }
}

