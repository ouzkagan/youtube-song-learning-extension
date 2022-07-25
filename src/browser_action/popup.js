
window.onload = function ( ) {
  const disableButton = document.querySelector('#disableYtMemorizer')
	const enableButton = document.querySelector('#enableYtMemorizer')

	disableButton.addEventListener('click',function(){
    chrome.tabs.query({currentWindow:true, active:true},function(tabs){
      var activeTab = tabs[0]
      chrome.tabs.sendMessage(activeTab.id,{command:"disableExtension"})
    })

	})
	enableButton.addEventListener('click',function(){
    chrome.tabs.query({currentWindow:true, active:true},function(tabs){
      var activeTab = tabs[0]
      chrome.tabs.sendMessage(activeTab.id,{command:"enableExtension"})
    })
	})
}