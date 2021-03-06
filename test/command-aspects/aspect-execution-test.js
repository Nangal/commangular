"use strict";

describe("Aspect execution testing", function() {

	var provider;
	
	var interceptorExecutedBefore = false;
	var commandExecutedAfter = false;
	var afterInterceptorExecutedAfterCommand = false;
	var afterInterceptorExecutedAfterOnResult = false;
	var afterThrowingInterceptorExecutedAfterCommand = false;
	var onResultMethodExecuted = false;
	
	beforeEach(function() {

		commangular.reset();
		commangular.aspect('@Before(/Command[1-9]/)', function(){

			return {

				execute:function () {
					
					interceptorExecutedBefore = true;
				}
			}
			
		});
		commangular.aspect('@AfterExecution(/Command[1-9]/)', function(){

			return {

				execute : function() {

					if(commandExecutedAfter)
						afterInterceptorExecutedAfterCommand = true;
				}
			}
		});
		commangular.aspect('@After(/Command[1-9]/)', function(){

			return {

				execute : function() {

					if(commandExecutedAfter && afterInterceptorExecutedAfterCommand)
						afterInterceptorExecutedAfterOnResult = true;
				}
			}
		});

		commangular.aspect('@AfterThrowing(/Command[1-9]/)', function(){

			return {

				execute : function() {

					afterThrowingInterceptorExecutedAfterCommand = true;
				}
			}
		});

		commangular.aspect('@Around(/Command[1-9]/)', function(processor){

			return {

				execute : function() {

					var result = processor.invoke();
					return "Return from around 1";
				}
			}
		});

		commangular.aspect('@Around(/Command[1-9]/)', function(processor){

			
			return {

				execute : function() {

					var result = processor.invoke();
					return result;
				}
			}
		});

		commangular.create('Command1',function(){

			return {

				execute : function() {
					
					if(interceptorExecutedBefore) {
						commandExecutedAfter = true;
					}
					return "return From command1";
				},
				onResult: function(){

					onResultMethodExecuted = true;
				}
			};
		});

		commangular.create('Command2',function(){

			return {

				execute : function() {
					
					throw new Error("This is an error");
				}
			};
		});

		commangular.create('Command3',function(){

			return {

				execute : function() {
					
					throw new Error("This is an error");
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
		});
		inject();
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		dispatch({event:'AspectTestEvent'},function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
		});		
	});

	it("should execute the interceptor afterexecution the command", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		dispatch({event:'AspectTestEvent'},function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
			expect(afterInterceptorExecutedAfterCommand).toBe(true);
		});				
	});

	it("should execute the interceptor after the command", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		dispatch({event:'AspectTestEvent'},function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
			expect(afterInterceptorExecutedAfterCommand).toBe(true);
			expect(onResultMethodExecuted).toBe(true);
			expect(afterInterceptorExecutedAfterOnResult).toBe(true);
		});				
	});

	it("should execute the interceptor after throwing an exception", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command2');
		dispatch({event:'AspectTestEvent'},function() {

			expect(afterThrowingInterceptorExecutedAfterCommand).toBe(true);
		});		
	});

	it("should execute the interceptor Around ", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		dispatch({event:'AspectTestEvent'},function() {

			expect(afterThrowingInterceptorExecutedAfterCommand).toBe(true);
		});				
	});

	it("should execute the interceptor after rebuild commangular interceptors", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		commangular.build();
		dispatch({event:'AspectTestEvent'},function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
		});		
	});
});