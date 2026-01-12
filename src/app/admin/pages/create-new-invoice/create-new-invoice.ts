import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-new-invoice',
  imports: [FormsModule,NgClass],
  templateUrl: './create-new-invoice.html',
  styleUrl: './create-new-invoice.css'
})
export class CreateNewInvoice implements OnInit {

 @Input() workOrder: any = null;
 @Output() close = new EventEmitter<void>();
 @Output() save = new EventEmitter<any>(); // لإرسال بيانات الـ Report الجديدة


  // متغيرات الـ Form لتمثيل الحقول في الصورة
  form = {
    Client: '',
    Project: '',
    Date: '',
    Due: '',
    Amount: 0,
    WorkOrderId: ''
 };

 ngOnInit() {
    if (this.workOrder) {
      this.form.Client = this.workOrder.units || ''; // Best guess for client name from unit/project
      this.form.Project = this.workOrder.name || '';
      this.form.WorkOrderId = this.workOrder.id ? String(this.workOrder.id) : '';
      this.form.Date = new Date().toISOString().split('T')[0];
      // Due date + 30 days
      const due = new Date();
      due.setDate(due.getDate() + 30);
      this.form.Due = due.toISOString().split('T')[0];
    }
 }


  // الدوال
  doClose() {
    this.close.emit();
  }
  submitted = false;
  doSave() {
      this.submitted = true;
    if(
    !this.form.Client||
    !this.form.Project||
    !this.form.Date||
      !this.form.Due
  ){
    return; // ❌ يمنع الحفظ
  }
    // إرسال بيانات الـ Report الجديدة
    this.save.emit(this.form);
  }
forceDatePicker(event: Event) {
    const target = event.target as HTMLInputElement;
    // التأكد أن الدالة موجودة قبل استدعائها
    if (target.showPicker) {
      target.showPicker();
    }
  }

}
