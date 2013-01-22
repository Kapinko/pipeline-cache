/**
 * 
 */

(function () {
	var DEFAULT_TTL	= 250,
	
	cache			= {},
	make_done_func	= function (key) {

		return function () {
			var args	= arguments,
				queue	= cache[key].queue,
				now		= (new Date()).getTime();

			cache[key].active	= 0;
			cache[key].queue	= [];
			cache[key].last		= args;
			cache[key].time		= now;

			queue.forEach(function (args) {
				return function (queue_array_element) {
					queue_array_element.apply(null, args);
				};
			}(args));
		};
	},
	
	/**
	 * Does the cache have the given key?
	 * @param {string} key
	 * @return {boolean}
	 */
	hasKey	= function (key) {
		return cache.hasOwnProperty(key);
	},
	/**
	 * Get the length of the queue for the given key.
	 * @param {string} key
	 * @return {number}
	 */
	queueLength	= function (key) {
		if(hasKey(key)) {
			return cache[key].queue.length;
		}
		return 0;
	},
	/**
	 * Is the task for the given key active?
	 * @param {string} key
	 * @return {boolean}
	 */
	isActive	= function (key) {
		if (hasKey(key)) {
			return cache[key].active ? true : false;
		}
		return false;
	},
	
	/**
	 * Attempt to read from the cache for the given key and task.
	 * @param {string} key
	 * @param {function(err, callback)} task
	 * @param {function()} callback
	 */
	read	= function (key, task, callback, ttl) {
		if (!cache.hasOwnProperty(key)) {
			cache[key]	= {
				"queue": [],
				"active": 0,
				"last": null,
				"time": null
			}
		}
		
		ttl	= ((typeof ttl !== "undefined") ? ttl : DEFAULT_TTL);
		
		var now	= (new Date()).getTime(),
			cached	= (cache[key].last && cache[key].time && (now - cache[key].time <= ttl)) ?
				cache[key].last : null;
			
		if (cached) {
			callback.apply(null, cache[key].last);
			
		} else {
			cache[key].queue.push(callback);
			
			if (!cache[key].active) {
				cache[key].active	= 1;
			
				task(null, make_done_func(key));
			}
		}
	}
	
	module.exports	= {
		"hasKey": hasKey,
		"queueLength": queueLength,
		"isActive": isActive,
		"read": read
	}
}());
