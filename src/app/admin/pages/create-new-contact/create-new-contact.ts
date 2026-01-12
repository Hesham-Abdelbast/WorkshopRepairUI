import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-new-contact',
  imports: [FormsModule,NgFor,NgClass],
  templateUrl: './create-new-contact.html',
  styleUrl: './create-new-contact.css'
})
export class CreateNewContact {

    @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>(); // لإرسال بيانات الـ Report الجديدة


  // ServiceTypes=['Installation', 'Maintenance', 'Update'];
  Types=['Maintenance', 'Turnkey','Supply','Service'];
  BillingCycles=['Monthly', 'Quarterly', 'Annual','One-off'];
  // متغيرات الـ Form لتمثيل الحقول في الصورة
  form = {
    Client: '',
    Type: '',
    LinkedProject: '',
    Start: '',
    End: '',
    BillingCycle: '',
    AmountperCycle:0
 };
//  //دي الي كانت في الاول قبل تعديل ال client
//   form = {
//     ClientCompanyName: '',
//     phoneNumber: '',
//     emailAddress: '',
//     location: '',
//     serviceType: '',
//  };


  // الدوال
  doClose() {
    this.close.emit();
  }
submitted = false;

  doSave() {
      this.submitted = true;
  if(
      !this.form.Client||
      !this.form.Type||
      !this.form.Start||
      !this.form.End||
      !this.form.BillingCycle||
      !this.form.LinkedProject
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
