import { LightningElement, api, track, wire } from 'lwc';
import getPicklistOptions from '@salesforce/apex/progressBarController.getPicklistOptions'
import updateRecord from '@salesforce/apex/progressBarController.updateRecord'
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import {
    registerRefreshContainer,
    unregisterRefreshContainer,
    REFRESH_ERROR,
    REFRESH_COMPLETE,
    REFRESH_COMPLETE_WITH_ERRORS,
} from "lightning/refresh";
import { refreshApex } from '@salesforce/apex';



export default class ProgressBar extends LightningElement {

    // Public properties to be set from the parent component or page
    @api sobjectAPI;
    @api picklistAPI;
    @api picklistChoicesAPI;
    @api dateAPI;
    @api headingLabel;
    @api recordId;
    _wiredMarketData

    // Internal state variables
    dateData = new Map(); // Stores date field values
    picklistData = new Map(); // Stores picklist field values
    @track steps = []; // Tracks the steps for the progress bar
    @track currentStep = ''; // Tracks the current step label
    picklistChoices = []; // Stores picklist choices
    currentStepValue = '';// Tracks the current step value

    // Wire the Apex method to fetch picklist options and date fields

    @wire(getPicklistOptions, { objName: '$sobjectAPI', fieldName: '$picklistAPI', datefields: '$dateAPI', recordId: '$recordId', picklistChoices: '$picklistChoicesAPI', booleanField: '' })
    results(wireResult) {
        const { data, error } = wireResult;
        this._wiredMarketData = wireResult;
        if (data) {
            let selStepValue
            //   console.log('-----------', data)
            // Process the data returned from the Apex method
            Object.keys(data).forEach((key, index) => {
                if (key != 'date')
                    this.picklistData.set(key, data[key])
                else if (key == 'date') {
                    let tmp = JSON.parse(data[key])[0]
                    Object.keys(tmp).forEach(key1 => {
                        console.log(key1)
                        if (this.dateAPI.includes(key1))
                            this.dateData.set(key1, tmp[key1])
                        if (key1 == this.picklistAPI) {
                            selStepValue = tmp[key1]
                        }
                    })
                }
            });
            // console.log(this.picklistData)
            console.log(this.dateData)

            let pickArray = this.picklistChoicesAPI.split(',')
            pickArray = pickArray.slice(0, 10)

            // Prepare the steps for the progress bar
            let tempSteps = []
            pickArray.forEach((item1, index1) => {
                this.picklistData.keys().forEach((item) => {
                    if (item == item1)
                        tempSteps.push({ label: this.picklistData.get(item), class: 'slds-path__item slds-is-incomplete', stage: '', index: index1, value: item })
                })
            })

            let dateArray = this.dateAPI.split(',')
            dateArray = dateArray.slice(0, 10)

            // Add date information to the steps
            dateArray.forEach((item1, index1) => {
                this.dateData.keys().forEach((item) => {
                    if (item == item1)
                        tempSteps[index1].date = this.dateData.get(item)
                })
            })

            this.steps = tempSteps  // Update the steps
            if (selStepValue) { //Show the existing picklist value
                this.handlePathFocus({ currentTarget: { dataset: { index: this.steps.findIndex(i => i.value == selStepValue) } } })
            }
        }
        else if (error) {
            console.error(error)// Log any errors
        }
    }


    connectedCallback() {
        this.refreshContainerID = registerRefreshContainer(this, this.refreshContainer);
    }

    disconnectedCallback() {
        unregisterRefreshContainer(this.refreshContainerID);
    }

    // Handle the focus event on the progress bar steps
    handlePathFocus(event) {
        this.currentStep = ''
        event.type ? event.preventDefault() : ''
        console.log(event.currentTarget.dataset.index)
        let stepIndex = parseInt(event.currentTarget.dataset.index, 10);


        // Update the class and stage of each step based on the focused step
        this.steps = this.steps.map((item, index) => {
            if (index < stepIndex) {
                return { ...item, class: 'slds-path__item slds-is-complete', stage: 'Stage Complete' };
            } else if (index === stepIndex) {
                this.currentStep = item.label + ' ' + (item.date || '');
                this.currentStepValue = item.value
                return { ...item, class: 'slds-path__item slds-is-active slds-is-current', stage: 'Current Stage:' };
            } else {
                return { ...item, class: 'slds-path__item slds-is-incomplete', stage: '' };
            }
        });
    }

    //Handles update functionality
    handleUpdate(event) {
        updateRecord({ objectApiName: this.sobjectAPI, recordId: this.recordId, fieldApiName: this.picklistAPI, fieldValue: this.currentStepValue })
            .then(result => {
                if (result)
                    getRecordNotifyChange([{ recordId: this.recordId }]); //to refresh the record details on the UI
                this.dispatchEvent(new ShowToastEvent({
                    title: "Sucess",
                    message: "The value is updated!!",
                    variant: "success",
                }));
            })
            .catch(error => console.log(error))
    }

    //to refresh the component everytime a record change happens on the UI
    refreshContainer(refreshPromise) {
        refreshApex(this._wiredMarketData);
    }

}