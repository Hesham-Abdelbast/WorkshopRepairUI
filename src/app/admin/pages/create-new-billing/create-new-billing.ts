import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-new-billing',
  imports: [FormsModule,NgFor,NgClass],
  templateUrl: './create-new-billing.html',
  styleUrl: './create-new-billing.css'
})
export class CreateNewBilling {

 @Output() close = new EventEmitter<void>();
 @Output() save = new EventEmitter<any>(); // لإرسال بيانات الـ Report الجديدة


  BillingCycles=['Monthly', 'Quarterly', 'Yearly'];


  // متغيرات الـ Form لتمثيل الحقول في الصورة
  form = {
    Client: '',
    Title: '',
    IssueDate: '',
    DueDate: '',
    Project: '',
    Contract: '',
    BillingCycle: '',
    Terms: 0,
    RecurringEnabled: false,

 };
  // الدوال
  doClose() {
    this.close.emit();
  }
submitted = false;
  doSave() {
  this.submitted = true;
    if(
    !this.form.Client||
    !this.form.Title||
    !this.form.IssueDate||
    !this.form.DueDate ){
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
