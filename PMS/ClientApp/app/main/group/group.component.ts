import { Observable } from 'rxjs/Observable';
import "rxjs/add/Observable/forkJoin";

import { Response } from '@angular/http';
import { NotificationService } from './../../core/services/notification.service';
import { DataService } from './../../core/services/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AuthenService } from './../../core/services/authen.service';
import { IMultiSelectOption, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html'
})

export class GroupComponent implements OnInit {
  @ViewChild('modalAddEdit') public modalAddEdit: ModalDirective;
  @ViewChild('enrollmentModal') public enrollmentModal: ModalDirective;

  public groups: any[];
  public queryResult: any = {};

  public group: any = {};
  public groupJson: any = {};
  public enrollment: any;

  public isClicked: boolean;
  public isLoading: boolean;
  public isLoadGroup: boolean;
  public isLoadData: boolean;

  isAdmin: boolean;
  isLecturer: boolean;
  isStudent: boolean;

  projects: any[];
  lecturers: any[];
  quarters: any[];
  public enrollments: string[] = [];

  majors: any[];
  PAGE_SIZE = 5;

  query: any = {
    pageSize: this.PAGE_SIZE,
    isConfirm: "Pending"
  };

  public user: any;

  public typeStatus: any[] = ["Accepted", "Pending", "Denied"];

  constructor(private _authenService: AuthenService, private _dataService: DataService, private _notificationService: NotificationService) {
    this.isLoading = false;
    this.isLoadData = false;
    this.isClicked = false;
    this.isAdmin = false;
    this.isLecturer = false;
  }

  ngOnInit() {
    this.loadData();
    this.permissionAccess();
    Observable.forkJoin([
      this._dataService.get("/api/quarters/getall"),
      this._dataService.get("/api/majors/getall"),
      this._dataService.get("/api/projects/getall"),
      this._dataService.get("/api/lecturers/getall"),

    ]).subscribe(data => {
      this.quarters = data[0].items,
        this.majors = data[1].items,
        this.projects = data[2].items,
        this.lecturers = data[3].items
      });

      
  }

  onMajorChange() {
    var selectedMajor = this.majors.find(m => m.majorId == this.group.majorId);
    var thisMajorLecturers =
      this._dataService.get("/api/lecturers/getlecturersbymajor/" + selectedMajor.majorId)[0].items;
    this.lecturers = selectedMajor.majorId ? thisMajorLecturers : [];
    this.projects = selectedMajor.majorId ? selectedMajor.projects : [];
  }

  onLecturerChange() {
    var selectedLecturer = this.lecturers.find(l => l.lecturerId == this.group.lecturerId);
    this.group.majorId = selectedLecturer.majorId;
  }


  loadData() {
    this._dataService.get("/api/groups/getall" + "?" + this.toQueryString(this.query)).subscribe((response: any) => {
      this.queryResult = response;
      this.isLoadData = true;
    });
  }

  toQueryString(obj) {
    var parts = [];
    for (var property in obj) {
      var value = obj[property];
      if (value != null && value != undefined)
        parts.push(encodeURIComponent(property) + '=' + encodeURIComponent(value));
    }

    return parts.join('&');
  }

  //Create method
  showAddModal() {
    this.group = {};
    this.isLoadGroup = true;
    this.modalAddEdit.show();
  }

  handler(type: string, $event: ModalDirective) {
    if (type === "onHide" || type === "onHidden") {
      this.enrollments = [];
    }
  }

  //Edit method
  showEditModal(id: any) {
    this.loadGroup(id);
    this.isLoadGroup = true;
    this.modalAddEdit.show();
  }

  hideAddEditModal() {
    this.modalAddEdit.hide();
    this.enrollments = [];
    this.isLoading = false;
  }


  //Get Group with Id
  loadGroup(id: any) {
    this._dataService.get('/api/groups/getgroup/' + id)
      .subscribe((response: any) => {
        this.group = response;
        for (let e of response.enrollments) {
          this.enrollments.push(e.studentEmail);
        }
        this.isLoading = true;
      });
  }

  saveChange(valid: boolean) {
    if (valid) {
      this.isClicked = true;
      if (this.group.groupId == undefined) {
        this.group.enrollments = this.enrollments;
        this._dataService.post('/api/groups/add', JSON.stringify(this.group))
          .subscribe((response: any) => {
            this.loadData();
            this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage("Add Success");
            this.isClicked = false;
            this.isLoading = false;
          }, error => this._dataService.handleError(error));
      }
      else {
        this.groupJson = {
          groupName: this.group.groupName,
          isConfirm: this.group.isConfirm,
          projectId: this.group.projectId,
          lecturerId: this.group.lecturerId,
          majorId: this.group.majorId,
          quarterId: this.group.quarterId,
          students: this.group.students
        };
        console.log(JSON.stringify(this.groupJson));
        this._dataService.put('/api/groups/update/' + this.group.groupId, JSON.stringify(this.groupJson))
          .subscribe((response: any) => {
            this.loadData();
            this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage("Update Success");
            this.isClicked = false;
            this.isLoading = false;
          }, error => this._dataService.handleError(error));
      }
    }
  }

  deleteGroup(id: any) {
    this._notificationService.printConfirmationDialog("Delete confirm", () => this.deleteConfirm(id));
  }

  deleteConfirm(id: any) {
    this._dataService.delete('/api/groups/delete/' + id)
      .subscribe((response: Response) => {
        this._notificationService.printSuccessMessage("Delete Success");
        this.loadData();
      });
  }

  permissionAccess() {
    this.user = this._authenService.getLoggedInUser();
    if (this.user.role === "Admin") {
      this.isAdmin = true;
    }

    if (this.user.role === "Lecturer") {
      this.isLecturer = true;
    }

    if (this.user.role === "Student") {
      this.isStudent = true;
    }
  }

  onPageChange(page) {
    this.query.page = page;
    this.loadData();
  }

  public allEnrollments: IMultiSelectOption[] = [];

  // Settings configuration
  mySettings: IMultiSelectSettings = {
    pullRight: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
    displayAllSelectedText: true
  };
}