@IsTest
private class MapControllerTest {
    @IsTest
    static void deleteStoreTest() {
        Account storeToBeDeleted = new Account(
            Name = 'Test Store',
            BillingStreet = 'Test Street',
            BillingCity = 'Test City',
            BillingState = 'Test State',
            BillingPostalCode = '00000',
            BillingCountry = 'Test Country',
            Store_Type__c= 'Market',
            Store__c = true
        );

        insert storeToBeDeleted;

        Test.startTest();
            MapController.deleteSelectedStore(storeToBeDeleted.Id);
        Test.stopTest();

        List<Account> stores=[SELECT Id, Name
                              FROM Account
                              WHERE Id = :storeToBeDeleted.Id]; 

        System.assertEquals( 0, stores.size(), 'no accounts should have found' );
    }

    @IsTest
    static void updateSelectedStoreTest(){
        Account storeToBeUpdated = new Account(
            Name = 'Test Store',
            BillingStreet = 'Test Street',
            BillingCity = 'Test City',
            BillingState = 'Test State',
            BillingPostalCode = '00000',
            BillingCountry = 'Test Country',
            Store_Type__c= 'Market',
            Store__c = true
        );

        insert storeToBeUpdated;

        Test.startTest();
            MapController.updateSelectedStore(
                storeToBeUpdated.Id,
                'Updated Name',
                'Updated Street',
                'Updated City',
                'Updated State',
                '11111',
                'Updated Country',
                'Market;Online Store'
            );
        Test.stopTest();

        storeToBeUpdated = [SELECT Name,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,Store_Type__c
                            FROM Account];
        System.assertEquals( 'Updated Name',storeToBeUpdated.Name, 'Name should have been updated to "Updated Name"');
        System.assertEquals( 'Updated Street',storeToBeUpdated.BillingStreet, 'Street should have been updated to "Updated Street"');
        System.assertEquals( 'Updated City',storeToBeUpdated.BillingCity, 'BillingCity should have been updated to "Updated City"');
        System.assertEquals( 'Updated State',storeToBeUpdated.BillingState, 'BillingState should have been updated to "Updated State"');
        System.assertEquals( '11111',storeToBeUpdated.BillingPostalCode, 'BillingPostalCode should have been updated to "11111"');
        System.assertEquals( 'Updated Country',storeToBeUpdated.BillingCountry, 'BillingCountry should have been updated to "Updated Country"');
        System.assertEquals( 'Market;Online Store',storeToBeUpdated.Store_Type__c, 'Store_Type__c should have been updated to "Market;Online Store"');
    }

    @IsTest
    static void getStoreLocationsTest(){
        List<Account> stores = TestDataFactory.createStores(
            'Test Store',
            'Test Street',
            'Test City',
            'Test State',
            '00000',
            'Test Country',
            'Market',
            10);
       Test.startTest();
            List<Account> storeLocations = MapController.getStoreLocations(); 
       Test.stopTest();

       System.assertEquals(stores.size(), storeLocations.size());
        
    }
}
