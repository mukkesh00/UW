import { LightningElement, api, track, wire } from 'lwc';
import getPicklistOptions from '@salesforce/apex/progressBarController.getPicklistOptions'
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

            // Prepare the steps for the progress bar
            let tempSteps = []
            this.picklistData.keys().forEach((item, index) => {
                tempSteps.push({ label: this.picklistData.get(item), class: 'slds-path__item slds-is-incomplete', stage: '', index: index })
            })

            // Add date information to the steps
            var j = 0
            this.dateData.keys().forEach((item, index) => {
                tempSteps[j].date = this.dateData.get(item)
                j++;
            })

            this.steps = tempSteps  // Update the steps
            //  console.log(this.dateData)
            //  console.log(this.picklistData)
        }
        else if (error) {
            console.error(error)// Log any errors
        }
    }

    // Handle the focus event on the progress bar steps
    handlePathFocus(event) {
        this.currentStep = ''
        event.preventDefault();
        const stepIndex = parseInt(event.currentTarget.dataset.index, 10);

        // Update the class and stage of each step based on the focused step
        this.steps = this.steps.map((item, index) => {
            if (index < stepIndex) {
                return { ...item, class: 'slds-path__item slds-is-complete', stage: 'Stage Complete' };
            } else if (index === stepIndex) {
                this.currentStep = item.label + ' ' + (item.date || '');
                return { ...item, class: 'slds-path__item slds-is-active slds-is-current', stage: 'Current Stage:' };
            } else {
                return { ...item, class: 'slds-path__item slds-is-incomplete', stage: '' };
            }
        });
    }

    handleUpdate(event){
        
    }
}