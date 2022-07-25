// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });


chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {

    // chrome.tabs.sendMessage(tabId, {message: "open_dialog_box"}, function(response) {});  

    // read changeInfo data and do something with it
    // like send the new url to contentscripts.js
    // chrome.tabs.sendMessage( tabId, {
      //   command: 'tab_changed',
      //   url: changeInfo.url
      // })
      
      
    if (changeInfo.url) {
      // console.log(tabId,'tab changed',changeInfo.url)
      chrome.tabs.sendMessage( tabId, {
        command: 'tab_changed',
        url: changeInfo.url
      })
      return true; 
    }
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    //   chrome.tabs.sendMessage(tabs[0].id, {command: 'tab_changed'}, function(response) {});  
    // })
    // if(changeInfo.url){
     
    // }
    return true; 
  
  }
);