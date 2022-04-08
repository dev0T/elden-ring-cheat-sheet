import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/helpers/auth.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import sampleData from '../data.json';
import { Profile } from '../shared/user';

@Component({
  selector: 'checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css'],
})
export class ChecklistComponent implements OnInit {
  private API_URL = environment.API_URL;
  endpoint: string = this.API_URL;
  active;
  disabled = true;
  items = sampleData;
  item_types = Object.keys(this.items);
  userProfiles: Profile[] = [];
  currentProfileName = '';
  currentProfile?: Profile;
  form: FormGroup;
  modalForm: FormGroup;
  helper = new JwtHelperService();
  private sub?: Subscription;

  get itemsFormGroup() {
    return this.form.controls['checklist'] as FormGroup;
  }

  getListType(listName: string): string[] {
    return Object.keys(
      (this.itemsFormGroup.controls[listName] as FormGroup).controls
    );
  }

  getFormGroup(listName: string) {
    return this.itemsFormGroup.controls[listName] as FormGroup;
  }

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal
  ) {
    this.form = this.formBuilder.group({
      checklist: new FormGroup(
        this.item_types.reduce((aggregator, key) => {
          const agg = {};
          this.items[key].forEach((obj) => {
            agg[obj.box] = new FormControl(false);
          });
          return {
            ...aggregator,
            [key]: new FormGroup(agg),
          };
        }, {})
      ),
    });
    this.modalForm = this.formBuilder.group({
      profileName: new FormControl(''),
    });
  }

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then()
      .catch((error) => {
        console.log('Modal error: ', error);
      });
  }

  ngOnInit(): void {
    this.authService.getUserProfiles().subscribe((user) => {
      this.userProfiles = user.profiles;
      this.currentProfile = this.userProfiles[0];
      if (this.currentProfile) {
        this.currentProfileName = this.currentProfile.name;
        this.setChecklistValues();
      } else this.currentProfileName = 'Default';
      this.subFormChanges();
    });
  }

  ngOnDestroy() {
    this.unsubFormChanges();
  }

  /**
   * Check if there's a profile with given name inside the profile Array.
   * @param profileName string containing the profile name
   * @returns returns the profile object if found, otherwise returns false
   */
  targetProfileExists(profileName: string): Profile | undefined {
    return this.userProfiles?.find((profile) => profile.name === profileName);
  }

  /**
   * UI toggle for active checklist view
   */
  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }

  /**
   * Subscribe to form value changes
   */
  subFormChanges() {
    this.sub = this.form.valueChanges.subscribe((value) => {
      this.setProfileValues(value);
    });
  }

  /**
   * Unsubscribe to form value changes
   */
  unsubFormChanges() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
   * Attempts to sync the user profiles with the API
   * @returns
   */
  saveProfiles() {
    return this.http
      .post(`${this.endpoint}/api/user`, this.userProfiles)
      .pipe(shareReplay(1))
      .subscribe();
  }

  setSelectedProfileByName(name: string) {
    const targetProfile = this.targetProfileExists(name);
    if (targetProfile) {
      this.currentProfile = targetProfile;
      this.currentProfileName = name;
      this.refreshChecklistValues();
    }
  }

  /**
   * When a new target is selected on the profiles list, check if it is a new value, if it exists in the profile array and then select the current profile to the selected one.
   * @param e
   */
  setSelectedProfile(e) {
    const targetProfileName = e.target.value;
    this.setSelectedProfileByName(targetProfileName);
  }

  /**
   * Attempts to store the information in the current profile. Clean the form and populate it with the next profile information.
   */
  refreshChecklistValues() {
    this.unsubFormChanges();
    this.setChecklistValues();
    this.subFormChanges();
  }

  setChecklistValues() {
    if (this.currentProfile) {
      if (Object.keys(this.currentProfile.checklist).length > 0) {
        this.form.controls['checklist'].setValue(this.currentProfile.checklist);
      } else {
        this.form.reset();
      }
    }
  }

  /**
   *
   * @param value
   */
  setProfileValues(value) {
    let currentProfile = this.targetProfileExists(this.currentProfileName);
    if (currentProfile) {
      currentProfile.checklist = this.form.value.checklist;
    }
    this.saveProfiles();
  }

  /**
   * Creates a new profile object and add it to the profiles Array
   */
  onAddProfile() {
    let newProfileName = this.modalForm.value.profileName;
    if (!this.targetProfileExists(newProfileName)) {
      let newProfile = { name: newProfileName, checklist: {} };
      this.userProfiles = [...(this.userProfiles as any), newProfile];
    }
    this.saveProfiles();
    this.modalService.dismissAll();
  }

  canDeleteProfile() {
    if (this.userProfiles) return this.userProfiles?.length > 1;
    return false;
  }

  /**
   * Find the current profile in the profile array and remove it.
   */
  deleteCurrentProfile() {
    let currentProfile = this.targetProfileExists(this.currentProfileName);
    if (currentProfile) {
      let profileIndex = this.userProfiles?.indexOf(currentProfile);
      if (profileIndex !== -1) {
        this.userProfiles?.splice(profileIndex, 1);
        this.setSelectedProfileByName(this.userProfiles[0].name);
        this.saveProfiles();
      }
    }
  }

  logOut() {
    this.authService.logOut();
  }
}
