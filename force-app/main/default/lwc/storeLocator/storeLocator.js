import { LightningElement, wire, track, api} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//Objects and Fields
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import BILLINGCITY_FIELD from '@salesforce/schema/Account.BillingCity';
import BILLINGPOSTALCODE_FIELD from '@salesforce/schema/Account.BillingPostalCode';
import BILLINGCOUNTRY_FIELD from '@salesforce/schema/Account.BillingCountry';
import BILLINGSTATE_FIELD from '@salesforce/schema/Account.BillingState';
import BILLINGSTREET_FIELD from  '@salesforce/schema/Account.BillingStreet';
import STORE_TYPE_C_FIELD from '@salesforce/schema/Account.Store_Type__c';
import STORE_C_FIELD from '@salesforce/schema/Account.Store__c';

//Controller
import getStoreLocations from '@salesforce/apex/MapController.getStoreLocations';
import deleteSelectedStore from '@salesforce/apex/MapController.deleteSelectedStore';
import updateSelectedStore from '@salesforce/apex/MapController.updateSelectedStore';

export default class StoreLocator extends LightningElement {
    mapOptions={
        disableDefaultUI: true,
        zoomControl: true
    }
    selectedAccountId = '';
    editDeleteButtonsDisabled = true;
    error;
    mapMarkers = [];
    allMarkers = [];
    zoomLevel = 18; 
    isModalOpen = false;
    wiredStoreList = [];

    customMapMarker = 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z';   

   selectedStore = {};
   

   selectedFilters = [];

   //Modal page will be edited based on clicked button
   modalHeader='';
   modalTitle='';
   submitButton='';
   isUpdate;

   //Fields on modal
   name = '';
   city='';
   country='';
   state='';
   postalCode='';
   storeTypes='';
   store = true;
   typeSelectList=[];
   street='';

   options = [
    { label: 'Bar/Restaurant', value: 'Bar/Restaurant' },
    { label: 'Market', value: 'Market' },
    { label: 'Online Store', value: 'Online Store' },
    ];

   openModal(event) {
        this.isModalOpen = true;
        if('createButton'==event.target.name){
            this.modalHeader='Create New Store';
            this.modalTitle='New Store';
            this.submitButton='Create';
            this.isUpdate = false;
            this.clearModalFields();
        }
        else if('editButton'== event.target.name){
            this.modalHeader = 'Edit Store';
            this.modalTitle = 'Edit';
            this.submitButton = 'Submit';
            this.isUpdate = true;

            this.setSelectedStoreInfo(this.selectedAccountId);
        }
    }
    closeModal() {
        this.isModalOpen = false;
        this.clearModalFields();
    }

    //Handle functions
    handleNameChange(event) {
        this.name = event.target.value;
    }
    handleCityChange(event) {
        this.city = event.target.value;
    }
    handleCountryChange(event) {
        this.country = event.target.value;
    }
    handleStateChange(event) {
        this.state = event.target.value;
    }
    handlePostalCodeChange(event) {
        this.postalCode = event.target.value;
    }
    handleTypeChange(event){
        this.typeSelectList = event.detail.value;
    }
    handleStreetChange(event){
        this.street = event.detail.value;
    }
    handleFilterChange(event){
        try{
            setTimeout(()=>{
                this.editDeleteButtonsDisabled = true;
                this.selectedFilters = event.detail.value;
                const filterArray = [];
                event.detail.value.forEach((e)=>{
                    filterArray.push(e);
                });
                if (filterArray.length === 0){
                    this.mapMarkers = this.allMarkers;
                 }
                 else {                
                    this.mapMarkers = this.allMarkers.filter((obj) =>{
                         if(obj.storeTypes){
                            return this.filterMarkers(filterArray,obj.storeTypes.split(';')  );
                         }
                     });
                 }

            },1000)
        }
        catch(e){
            console.log('error in filter');
            console.log(e);
        }
        
    }
    handleMarkerSelect(event){
        this.selectedAccountId = event.target.selectedMarkerValue;
        this.setSelectedStoreInfo(event.target.selectedMarkerValue);
    }
    handleDeleteButtonClick(){
        deleteSelectedStore({accountId:this.selectedAccountId})
        .then(response => {
            refreshApex(this.wiredStoreList);
            this.editDeleteButtonsDisabled = true;
            this.clearModalFields();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: response,
                    variant: 'success',
                }),
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        });
    }
    handleSubmit(){
        if(this.validateRequiredFields()){
            console.log(this.validateRequiredFields());
            if(!this.isUpdate){
                this.createAccount();
            }
            else{
                this.updateStore();
            }
        }
        else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Warning',
                    message: 'Required fields must be filled',
                    variant: 'warning',
                }),
            );
        }
        
    }

    //Helper functions
    validateRequiredFields(){
        console.log(this.typeSelectList.length);
        if (this.name == '' || this.street == '' || this.city == ''|| this.country == '' || this.state == '' || this.postalCode == '' || this.typeSelectList.length == 0 ){
            return false;
        }
        return true;
    }
    getTypeSelectionString(selectValuesArray){
        //This function gets the checked store types and returns them as string. So that we can insert them with Apex.
        const typeArray = [];
        selectValuesArray.forEach((e)=>{
            typeArray.push(e);
        })
        return typeArray.join(';');
    }
    getTypeSelectionStringToArray(selectValuesString){
        try{
            return selectValuesString.split(';');
        }
        catch(e){
            console.log(e);
        }
        
    }
    filterMarkers(typeFiltersArray,markerTypesArray){
        //This function returns true if first array is subset of the second.
        return typeFiltersArray.every(val => markerTypesArray.includes(val));
    } 
    setSelectedStoreInfo(selectedId){
        this.selectedStore = this.wiredStoreList.data.filter(obj => {
            return obj.Id == selectedId;
        })
        this.name = this.selectedStore[0].Name;
        this.city = this.selectedStore[0].BillingCity;
        this.country = this.selectedStore[0].BillingCountry;
        this.state = this.selectedStore[0].BillingState;
        this.postalCode = this.selectedStore[0].BillingPostalCode;
        this.street = this.selectedStore[0].BillingStreet;
        this.typeSelectList = this.getTypeSelectionStringToArray(this.selectedStore[0].Store_Type__c);
        console.log('selectedId' +selectedId);
        console.log(this.selectedStore);
        this.editDeleteButtonsDisabled = false;
        
        console.log(this.street);
    }
    clearModalFields(){
        this.name = '';
        this.city = '';
        this.country = '';
        this.state = '';
        this.postalCode = '';
        this.type = '';
        this.typeSelectList = [];
        this.street = '';
    }

 //Get stores from db and set markers
   @wire(getStoreLocations)
   wiredStoreLocations(result) {
        if (result.data) {     
            this.mapMarkers = [];
            this.allMarkers = [];
            this.wiredStoreList = result;    
            console.log(result.data)   
            result.data.forEach((dataItem,index) => {
                if(dataItem.Latitude__c && dataItem.Longitude__c){
                    this.allMarkers = [...this.allMarkers ,
                        {
                            location: {
                                Latitude: dataItem.Latitude__c ,
                                Longitude: dataItem.Longitude__c,
                            },
                            value: dataItem.Id,
                            icon: 'custom:custom26',
                            title: dataItem.Name+' Types: '+dataItem.Store_Type__c.replaceAll(';',' - '),
                          //  type:  dataItem.Type__c,
                            storeTypes: dataItem.Store_Type__c,
                            mapIcon : { 
                                path: this.customMapMarker,
                                fillColor: 'black', 
                                fillOpacity: .8, 
                                strokeWeight: 1, 
                                scale: .10, },
                        }                                    
                    ];
                }
                else{
                    this.allMarkers = [...this.allMarkers ,
                        {
                            location: {
                                City: dataItem.BillingCity,
                                Country: dataItem.BillingCountry,
                                PostalCode: dataItem.BillingPostalCode,
                                State: dataItem.BillingState,
                                Street: dataItem.BillingStreet,
                            },
                            value: dataItem.Id,
                            icon: 'custom:custom26',
                            title: dataItem.Name+' Types: '+dataItem.Store_Type__c.replaceAll(';',' - '),
                        //  type:  dataItem.Type__c,
                            storeTypes: dataItem.Store_Type__c,
                            mapIcon : { 
                                path: this.customMapMarker,
                                fillColor: 'black', 
                                fillOpacity: .8, 
                                strokeWeight: 1, 
                                scale: .10, },
                        }                                    
                    ];
                }
                
            });  
            this.mapMarkers = this.allMarkers;          
            this.error = undefined;
        } else if (result.error) {
            
            this.error = error;

            console.log(this.error);
        }
    }
    
    //DB actions
    createAccount() {
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.name;
        fields[BILLINGCITY_FIELD.fieldApiName] = this.city;
        fields[BILLINGPOSTALCODE_FIELD.fieldApiName] = this.postalCode;
        fields[BILLINGCOUNTRY_FIELD.fieldApiName] = this.country;
        fields[BILLINGSTATE_FIELD.fieldApiName] = this.state;
        fields[BILLINGSTREET_FIELD.fieldApiName] = this.street;
        fields[STORE_C_FIELD.fieldApiName] = true;
        fields[STORE_TYPE_C_FIELD.fieldApiName] = this.getTypeSelectionString(this.typeSelectList);
        const recordInput = { apiName: ACCOUNT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(response => {
                this.closeModal();
                //refreshApex(this.wiredStoreList);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Store created',
                        variant: 'success',
                    }),
                );
                refreshApex(this.wiredStoreList);
            })
            .catch(error => {
                console.log(error)
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

    updateStore(){  
        this.editDeleteButtonsDisabled=true;
        updateSelectedStore({accountId:this.selectedAccountId,name:this.name,street:this.street,city:this.city,state:this.state,postalCode:this.postalCode,country:this.country,storeType:this.getTypeSelectionString(this.typeSelectList)})
        .then(response => {
            refreshApex(this.wiredStoreList);
            this.closeModal();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Store updated successfully',
                    message: response,
                    variant: 'success',
                }),
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        });
    }
   
}