import { Billing } from './../billing/billing';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Unit, UnitService } from '../../../core/unit.service';
import { ResourceService } from '../../../core/resource.service';

@Component({
  selector: 'app-create-new-unit',
  imports: [FormsModule,CommonModule,HttpClientModule],
  templateUrl: './create-new-unit.html',
  styleUrl: './create-new-unit.css'
})
export class CreateNewUnit {
 finalData:Unit={
    id: 0,
    clientId: 0,    
    serial: '',
    model: '',
    lat: 0,
    lng: 0
  };
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>(); // لإرسال بيانات الـ Report الجديدة  
 // قائمة الفنيين والمتاحين (مثال)
  projects: { id: number, name: string }[] = [];
  buildings = ['Building 1', 'Building 2'];
  elevatorTypes = ['Passenger', 'Freight', 'Panoramic'];
  motorTypes = ['AC', 'DC', 'Gearless'];
  controlSystems = ['Manual', 'Automatic', 'Computerized'];
  driveSystems = ['Hydraulic', 'Traction', 'MRL'];
  clients: { id: number, name: string }[] = [];
  selectedClientId: number | null = null;
  selectedProjectId: number | null = null;
  addressQuery: string = '';
  addressSuggestions: { display_name: string; lat: string; lon: string }[] = [];
  showAddressDropdown: boolean = false;

  // متغيرات الـ Form لتمثيل الحقول في الصورة
  form = {
    UnitNumber: '',
    unitName: '',
    Project: '',
    Building: '',
    Capacity: '',
    ElevatorType: '',
    NoPeople:'',
    MotorType: '',
    Speed: '',
    ControlSystem: '',
    NoFloors: '',
    DriveSystem: '',
    Description: '',
    siteAddress: ''
//     photos: [] as string[]
  };
  // الدوال
  doClose() {
    this.close.emit();
  }
submitted = false;
constructor(private UnitService: UnitService, private resource: ResourceService, private http: HttpClient) {}
ngOnInit(): void {
  this.resource.getAll('Clients').subscribe({
    next: (list) => {
      this.clients = (list || []).map((c: any) => ({ id: c.id, name: c.name }));
      if (this.clients.length) this.selectedClientId = this.clients[0].id;
    },
    error: () => { this.clients = []; this.selectedClientId = null; }
  });
  this.resource.getAll('Projects').subscribe({
    next: (list) => {
      this.projects = (list || []).map((p: any) => ({ id: p.id, name: p.name ?? p.projectName }));
      this.selectedProjectId = null;
    },
    error: () => { this.projects = []; this.selectedProjectId = null; }
  });
}
onAddressInput() {
  this.showAddressDropdown = true;
  const q = (this.addressQuery || '').trim();
  if (q.length < 3) {
    this.addressSuggestions = [];
    return;
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(q)}`;
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.addressSuggestions = res || [];
    },
    error: () => {
      this.addressSuggestions = [];
    }
  });
}
selectSuggestion(s: { display_name: string; lat: string; lon: string }) {
  this.form.siteAddress = s.display_name;
  this.addressQuery = s.display_name;
  this.showAddressDropdown = false;
  this.finalData.lat = parseFloat(s.lat) || 0;
  this.finalData.lng = parseFloat(s.lon) || 0;
}
  doSave() {
      this.submitted = true;
  if(
    !this.form.UnitNumber||
    !this.form.unitName||
    !this.form.Building||
    !this.form.Capacity||
    !this.form.ElevatorType||
    !this.form.NoPeople||
    !this.form.MotorType||
    !this.form.Speed||
    !this.form.ControlSystem||
    !this.form.DriveSystem||
    !this.form.NoFloors
    ){
    return; // ❌ يمنع الحفظ
  }

  
  this.finalData.serial=this.form.UnitNumber;
  this.finalData.model=this.form.unitName;
  this.finalData.clientId = this.selectedClientId || 0;   
  this.finalData.projectId = this.selectedProjectId || undefined;
  this.finalData.lat = this.finalData.lat || 0;
  this.finalData.lng = this.finalData.lng || 0;
    // إرسال بيانات الـ Report الجديدة
    this.save.emit(this.form);
    this.UnitService.setNew(this.finalData).subscribe(data => {
    });
  }

    // دالة لفتح محدد التاريخ/الوقت عند النقر (كما فعلنا سابقاً)
    forceDatePicker(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.showPicker) {
              target.showPicker();
        }
    }
//   openFilePicker() {
//   const input = document.createElement('input');
//   input.type = 'file';
//   input.multiple = true;
//   input.accept = 'image/*'; // الصور فقط

//   input.onchange = (event: Event) => {
//     const target = event.target as HTMLInputElement;
//     const files = target.files;
//     if (!files || files.length === 0) return;

//     // فضي الصور القديمة
//     this.form.photos = [];

//     // حول FileList لمصفوفة File[]
//     const filesArray: File[] = Array.from(files);

//     filesArray.forEach((file: File) => {
//       if (file.size > this.maxFileSize * 1024 * 1024) {
//         console.warn(`File too large: ${file.name}`);
//         return;
//       }

//       if (!this.allowedFileTypes.includes(file.type)) {
//         console.warn(`Unsupported type: ${file.type}`);
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = () => {
//         // تأكد إن النتيجة Base64 string صالحة
//         if (reader.result) {
//           this.form.photos.push(reader.result as string);
//         }
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   // افتح File Picker يدويًا
//   input.click();
// }
}
