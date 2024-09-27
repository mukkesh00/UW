import { LightningElement, api, track, wire } from 'lwc';
import getPicklistOptions from '@salesforce/apex/progressBarController.getPicklistOptions'
import updateRecord from '@salesforce/apex/progressBarController.updateRecord'
import { ShowToastEvent } from "lightning/platformShowToastEvent";


export default class ProgressBar extends LightningElement {

    // Public properties to be set from the parent component or page
    @api sobjectAPI;
    @api picklistAPI;
    @api picklistChoicesAPI;
    @api dateAPI;
    @api headingLabel;
    @api recordId;

    // Internal state variables
    dateData = new Map(); // Stores date field values
    picklistData = new Map(); // Stores picklist field values
    @track steps = []; // Tracks the steps for the progress bar
    @track currentStep = ''; // Tracks the current step label
    picklistChoices = []; // Stores picklist choices
    currentStepValue = '';// Tracks the current step value

    // Wire the Apex method to fetch picklist options and date fields

    @wire(getPicklistOptions, { objName: '$sobjectAPI', fieldName: '$picklistAPI', datefields: '$dateAPI', recordId: '$recordId', picklistChoices: '$picklistChoicesAPI' })
    results({ data, error }) {
        if (data) {
            //  console.log('-----------', data)

            // Process the data returned from the Apex method
            Object.keys(data).forEach((key) => {
                if (key != 'date')
                    this.picklistData.set(key, data[key])
                else if (key == 'date') {
                    let tmp = JSON.parse(data[key])[0]
                    Object.keys(tmp).forEach(key => {
                        if (this.dateAPI.includes(key))
                            this.dateData.set(key, tmp[key])
                    })
                }
            });

            console.log(this.picklistData)
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

            // Add date information to the steps
            var j = 0
            this.dateData.keys().forEach((item, index) => {
                tempSteps[j].date = this.dateData.get(item)
                j++;
            })

            this.steps = tempSteps  // Update the steps
        }
        else if (error) {
            console.error(error)// Log any errors
        }
    }

    // Handle the focus event on the progress bar steps
    handlePathFocus(event) {
        this.currentStep = ''
        event.preventDefault();
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
                    this.dispatchEvent(new ShowToastEvent({
                        title: "Sucess",
                        message: "The value is updated!!",
                        variant: "success",
                    }));
            })
            .catch(error => console.log(error))
    }

}