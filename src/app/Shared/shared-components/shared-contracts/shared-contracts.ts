import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService } from '../../../core/resource.service';
import { SharedPageHeader } from '../../shared-layout/shared-page-header/shared-page-header';

interface Contract {
  id: number;
  selected: boolean;
  Title: string;
  Type: string;
  Status: string;
  Value: number;
  StartDate: string;
  EndDate: string;
  Client: string;
  Terms?: string;
}

@Component({
  selector: 'app-shared-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, SharedPageHeader],
  templateUrl: './shared-contracts.html',
  styleUrl: './shared-contracts.css'
})
export class SharedContracts implements OnInit {
  @Input() role: 'admin' | 'dispatcher' | 'manager' | 'client' | 'finance' | null = null;
  
  contracts: Contract[] = [];
  activeTab: 'list' | 'map' = 'list';
  searchText: string = '';
  allSelected = false;

  // Pagination
  page = 1;
  pageSize = 10;

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts() {
    const params: Record<string, string> = {};
    if (this.role) params['role'] = this.role;
    
    this.resourceService.getAll('Contracts', params).subscribe({
      next: (items: any[]) => {
        this.contracts = items.map(c => ({
          id: c.id,
          selected: false,
          Title: c.title || 'Untitled Contract',
          Type: c.type || 'Standard',
          Status: c.status || 'Draft',
          Value: c.value || 0,
          StartDate: c.startDate ? new Date(c.startDate).toLocaleDateString() : '',
          EndDate: c.endDate ? new Date(c.endDate).toLocaleDateString() : '',
          Client: c.client?.name || 'Unknown Client',
          Terms: c.terms
        }));
      },
      error: (err) => {
        console.error('Failed to load contracts', err);
      }
    });
  }

  onSelectChange(contract: Contract, event: any) {
    const action = event.target.value;
    if (action === 'delete') {
      if(confirm('Are you sure you want to delete this contract?')) {
        this.resourceService.delete('Contracts', contract.id).subscribe(() => this.loadContracts());
      }
    } else if (action === 'approve') {
        this.resourceService.update('Contracts', contract.id + '/approve', {}).subscribe(() => {
            contract.Status = 'Approved';
            alert('Contract Approved');
        });
    } else if (action === 'reject') {
        this.resourceService.update('Contracts', contract.id + '/reject', {}).subscribe(() => {
            contract.Status = 'Rejected';
            alert('Contract Rejected');
        });
    }
    event.target.value = '';
  }

  toggleAll() {
    this.contracts.forEach(c => c.selected = this.allSelected);
  }

  updateAllSelected() {
    this.allSelected = this.contracts.every(c => c.selected);
  }

  openCreate() {
      // Implement create modal if needed
      console.log('Open Create Contract Modal');
  }
}
