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
        List<String> picklistList = new List<String>(picklistSet);

        Set<String> dateSet = new Set<String>(dateFields.split(','));
        List<String> dateList = new List<String>(dateSet);

        List<String> processedPicklists = new List<String>();
        List<String> processedDates = new List<String>();

        for (Integer i = 0; i < 10 && i < picklistList.size(); i++) {
            processedPicklists.add(picklistList[i]);
        }

        for (Integer i = 0; i < 10 && i < dateList.size(); i++) {
            processedDates.add(dateList[i]);
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
                choices.put(picklistEntry.getLabel(), picklistEntry.getValue());
            }
        }

        System.debug(recordId);
        String queryRec = 'SELECT ' + dateString + ' FROM ' + objName + ' WHERE Id = \'' + recordId + '\' LIMIT 1';
        System.debug(queryRec);
        List<SObject> objectList = Database.query(queryRec);
        choices.put('date', JSON.serialize(objectList));

        return choices;
	}
}