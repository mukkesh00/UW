/**
* @File Name : progressBarController.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : September 25, 2024
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | September 25, 2024 |   | Initial Version
**/

public class progressBarController {
	
	@AuraEnabled(cacheable=true)
	Public static map<String, String> getPicklistOptions(String  objName, String fieldName, String datefields, String recordId, String picklistChoices ){
        Set<String> picklistSet = new Set<String>(picklistChoices.split(','));

        Set<String> dateSet = new Set<String>(dateFields.split(','));

        List<String> processedPicklists = new List<String>();
        List<String> processedDates = new List<String>();

        Integer i = 0;
        for(String ss : picklistSet)
        {
        i++;
        if(i < 10)
            processedPicklists.add(ss);
        }

        Integer j = 0;
        for(String ss : dateSet)
        {
        j++;
        if(j < 10)
            processedDates.add(ss);
        }

        String dateString = String.join(processedDates, ',');

        Map<String, String> choices = new Map<String, String>();
        Schema.SObjectType objSobjectType = Schema.getGlobalDescribe().get(objName);
        Schema.DescribeSObjectResult objDescribeSobject = objSobjectType.getDescribe();
        Map<String, Schema.SObjectField> fields = objDescribeSobject.fields.getMap();
        Schema.DescribeFieldResult fieldResult = fields.get(fieldName).getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();

        for (Schema.PicklistEntry picklistEntry : picklistEntries) {
            if (processedPicklists.contains(picklistEntry.getValue())) {
                choices.put(picklistEntry.getValue(),picklistEntry.getLabel());
            }
        }

        System.debug(recordId);
        String queryRec = 'SELECT ' + fieldName +','+ dateString + ' FROM ' + objName + ' WHERE Id = \'' + recordId + '\' LIMIT 1';
        System.debug(queryRec);
        List<SObject> objectList = Database.query(queryRec);
        choices.put('date', JSON.serialize(objectList));

        return choices;
	}


    @AuraEnabled
    public static String updateRecord(String objectApiName, String recordId, String fieldApiName, Object fieldValue) {
        // Create an instance of the sObject dynamically
        sObject recordToUpdate = Schema.getGlobalDescribe().get(objectApiName).newSObject(recordId);

        // Set the field value dynamically
        recordToUpdate.put(fieldApiName, fieldValue);

        String result = '';
        try {
            // Perform the update
            update recordToUpdate;
            result = 'true';
        } catch (DmlException e) {
            System.debug('An error occurred: ' + e.getMessage());
            result = null;
        }
        return result;
    }

}