import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateNewUnit } from '../../../admin/pages/create-new-unit/create-new-unit';
import { CreateServiceRequest } from '../../../client/pages/create-service-request/create-service-request';
import { SharedPageHeader } from '../../shared-layout/shared-page-header/shared-page-header';
import { ResourceService } from '../../../core/resource.service';

interface MaintenanceUnit {

  UnitNumber: number,
  unitName: string,
  Serial?: string,
  Model?: string,
  ClientName?: string,
  Project: string,
  Building: string,
  Capacity: string,
  ElevatorType: string,
  NoPeople: number,
  MotorType: string,
  Speed: number,
  ControlSystem: string,
  NoFloors: number,
  DriveSystem: string,
  Description: string,

}
@Component({
  selector: 'app-shared-units',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, CreateNewUnit, FormsModule, CommonModule, SharedPageHeader, CreateServiceRequest],
  templateUrl: './shared-units.html',
  styleUrl: './shared-units.css'
})
export class SharedUnits {

  @Input() role: 'admin' | 'dispatcher' | 'manager' | 'technician' | 'finance' | 'client' | null = null;

  showCreateUnitModal: boolean = false;
  showCreateRequestModal: boolean = false; // New modal state
  selectedUnitForRequest: any = null;      // Selected unit for request

  activeTab = 'Lifts';
  selectedUnitIndex: number | null = null;
  cardsPerRow = 1; // 👈 غيّرها حسب عدد الكروت في الصف عندك

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadTasks();
  }
  units: MaintenanceUnit[] = [];
  loadTasks() {
    const params: Record<string, string> = {};
    if (this.role) params['role'] = this.role;
    this.resource.getAll('Units', params).subscribe({
      next: (items) => {
        this.units = (items || []).map((u: any, i: number) => ({
          UnitNumber: u.unitNumber ?? (i + 1),
          unitName: u.unitName || u.name || `UNIT NAME ${i + 1}`,
          Serial: u.serial || u.Serial || '',
          Model: u.model || u.Model || '',
          ClientName: u.clientName || u.client?.name || '',
          Project: u.projectName || u.project || '',
          Building: u.building || '',
          Capacity: u.capacity || '',
          ElevatorType: u.type || u.elevatorType || '',
          NoPeople: u.noPeople ?? 0,
          MotorType: u.motorType || '',
          Speed: u.speed ?? 0,
          ControlSystem: u.controlSystem || '',
          NoFloors: u.noFloors ?? 0,
          DriveSystem: u.driveSystem || '',
          Description: u.description || ''
        }));
      },
      error: () => {
        this.units = Array.from({ length: 10 }, (_, i) => ({
          UnitNumber: 10,
          unitName: `UNIT NAME ${i + 1}`,
          Serial: `SN-${1000 + i}`,
          Model: `Model-${i + 1}`,
          ClientName: `Client ${i + 1}`,
          Project: 'MV822',
          Building: `Building ${i + 1}`,
          Capacity: '10/1/2024',
          ElevatorType: 'Nader Shaban',
          NoPeople: 180,
          MotorType: 'Scheduled',
          Speed: 180,
          ControlSystem: '',
          NoFloors: 10,
          DriveSystem: '',
          Description: `Detail ${i + 1}`,
        }));
      }
    });
  }



  changeTab(tab: string) {
    this.activeTab = tab;
    this.selectedUnitIndex = null;
  }

  toggleDetails(index: number) {
    this.selectedUnitIndex = this.selectedUnitIndex === index ? null : index;
  }



  openCreateRequest(unit: any) {
    this.selectedUnitForRequest = unit;
    this.showCreateRequestModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCreateRequest() {
    this.showCreateRequestModal = false;
    this.selectedUnitForRequest = null;
    document.body.style.overflow = 'auto';
  }

  onRequestCreated(request: any) {
    console.log('Service Request Created:', request);
    // Optionally show a toast or alert
    this.closeCreateRequest();
  }

  openCreateUnit() {
    this.showCreateUnitModal = true;
    document.body.style.overflow = 'hidden'; // يمنع scroll الصفحة

  }
  // 4. دالة لإغلاق الـ Modal
  closeCreateUnit() {
    this.showCreateUnitModal = false;
    document.body.style.overflow = 'auto'; // يرجع scroll الصفحة

  }
  saveNewReport(newUnit: any) {
    const payload = {
      unitNumber: newUnit.UnitNumber || 0,
      unitName: newUnit.unitName || '',
      projectName: newUnit.Project || '',
      building: newUnit.Building || '',
      capacity: newUnit.Capacity || '',
      elevatorType: newUnit.ElevatorType || '',
      noPeople: newUnit.NoPeople || 0,
      motorType: newUnit.MotorType || '',
      speed: newUnit.Speed || 0,
      controlSystem: newUnit.ControlSystem || '',
      noFloors: newUnit.NoFloors || 0,
      driveSystem: newUnit.DriveSystem || '',
      description: newUnit.Description || ''
    };
    this.resource.create('Units', payload).subscribe({
      next: (created) => {
        const data: MaintenanceUnit = {
          UnitNumber: created?.unitNumber ?? payload.unitNumber,
          unitName: created?.unitName ?? payload.unitName,
          Project: created?.projectName ?? payload.projectName,
          Building: created?.building ?? payload.building,
          Capacity: created?.capacity ?? payload.capacity,
          ElevatorType: created?.elevatorType ?? payload.elevatorType,
          NoPeople: created?.noPeople ?? payload.noPeople,
          MotorType: created?.motorType ?? payload.motorType,
          Speed: created?.speed ?? payload.speed,
          ControlSystem: created?.controlSystem ?? payload.controlSystem,
          NoFloors: created?.noFloors ?? payload.noFloors,
          DriveSystem: created?.driveSystem ?? payload.driveSystem,
          Description: created?.description ?? payload.description,
        };
        this.units.unshift(data);
        this.closeCreateUnit();
        document.body.style.overflow = 'auto';
      },
      error: () => {
        const data: MaintenanceUnit = {
          UnitNumber: payload.unitNumber,
          unitName: payload.unitName,
          Project: payload.projectName,
          Building: payload.building,
          Capacity: payload.capacity,
          ElevatorType: payload.elevatorType,
          NoPeople: payload.noPeople,
          MotorType: payload.motorType,
          Speed: payload.speed,
          ControlSystem: payload.controlSystem,
          NoFloors: payload.noFloors,
          DriveSystem: payload.driveSystem,
          Description: payload.description
        };
        this.units.unshift(data);
        this.closeCreateUnit();
        document.body.style.overflow = 'auto';
      }
    });

  }
  constructor(private resource: ResourceService) { }
}
