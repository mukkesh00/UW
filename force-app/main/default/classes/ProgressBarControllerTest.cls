/**
* @File Name : progressBarControllerTest.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : September 27, 2024
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | September 27, 2024 |   | Initial Version
**/

@isTest
public class ProgressBarControllerTest {
    
    @isTest
    static void testGetPicklistOptions() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // Define test parameters
        String objName = 'Account';
        String fieldName = 'Industry';
        String dateFields = 'CreatedDate,LastModifiedDate';
        String recordId = testAccount.Id;
        String picklistChoices = 'Agriculture,Apparel,Banking';

        // Call the method
        Map<String, String> result = ProgressBarController.getPicklistOptions(objName, fieldName, dateFields, recordId, picklistChoices);

        // Verify the results
        System.assert(result.containsKey('Agriculture'));
        System.assert(result.containsKey('Apparel'));
        System.assert(result.containsKey('Banking'));
        System.assert(result.containsKey('date'));
        System.assert(result.get('date').contains('CreatedDate'));
        System.assert(result.get('date').contains('LastModifiedDate'));
    }

    @isTest
    static void testUpdateRecord() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // Define parameters
        String objectApiName = 'Account';
        String recordId = testAccount.Id;
        String fieldApiName = 'Name';
        String fieldValue = 'Updated Account Name';

        // Call the method
        String result = progressBarController.updateRecord(objectApiName, recordId, fieldApiName, fieldValue);

        // Verify the result
        System.assertEquals('true', result);

        // Verify the record was updated
        Account updatedAccount = [SELECT Name FROM Account WHERE Id = :recordId];
        System.assertEquals(fieldValue, updatedAccount.Name);
    }

}