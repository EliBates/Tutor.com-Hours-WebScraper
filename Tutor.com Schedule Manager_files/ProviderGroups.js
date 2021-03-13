	var theProviderGroups = new Object();
	
	//public:
	function AddProviderGroup(groupID, groupName)
	{
		var theGroup = new providerGroup(groupID, groupName);
		theProviderGroups[groupID] = theGroup;
	}
	
	function ClearGroupAmountsDesired()
	{
		for (var i in theProviderGroups)
			theProviderGroups[i].amountDesired = 0;
	}
	
	function SetGroupAmountDesired(groupID, amount)
	{
		if (theProviderGroups[groupID] != null)
			theProviderGroups[groupID].amountDesired = amount;
	}
	
	function GetProviderGroup(groupID)
	{
		return theProviderGroups[groupID];
	}	
	
	//private:
	function providerGroup(id, name)
	{
		this.id = id;
		this.name = name;
		this.providers = new Object();	
		this.amountDesired = 0;	
	}

	function provider(id, name, hasDegree, voiceApproved)
	{
		this.id = id;
		this.name = name;
		this.hasDegree = hasDegree;
		this.voiceApproved = voiceApproved;
	}

	function cCollection()
	{	
		var lsize = 0;
		 
		this.add = _add;
		this.remove = _remove;
		this.isEmpty = _isEmpty;
		this.size = lsize;
		this.clearAll = _clearAll;
		this.clone = _clone;
	
		function _add(newItem) {
			/* --adds a new item to the collection-- */
			if (newItem == null) return;
			
			this.size++;
			
			this[(this.size - 1)] = newItem;
		}
	
		function _remove(index) {
			/* --removes the item at the specified index-- */
			if (index < 0 || index > this.length - 1) return;
			this[index] = null;
	
			/* --reindex collection-- */
			for (var i = index; i <= this.size; i++)
				this[i] = this[i + 1];
	
			this.size--;
		}
	
		function _isEmpty() 
		{ 
			return (this.size == 0);
		}
	
		function _clearAll()
		{
			for (var i = 0; i < this.size; i++)
				this[i] = null;
	
			this.size = 0;
		}
	
		function _clone()
		{
			var c = new cCollection();
	
			for (var i = 0; i < this.size; i++)
				c.add(this[i]);
	
			return c;
		}
	}

