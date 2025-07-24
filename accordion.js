(function() {
    'use strict';

    angular.module('systemApp')
        .directive('accordionComponent', accordionComponent)
        .directive('accordionItem', accordionItem);

    function accordionComponent() {
        return {
            restrict: 'E',
            scope: {
                type: '@', // 'single' or 'multiple'
                collapsible: '='
            },
            template: `
                <div class="accordion-container" ng-style="getAccordionStyle()">
                    <ng-transclude></ng-transclude>
                </div>
            `,
            transclude: true,
            controller: function($scope) {
                var ctrl = this;
                ctrl.items = [];
                ctrl.type = $scope.type || 'single';
                ctrl.collapsible = $scope.collapsible !== false;

                // Register accordion item
                ctrl.registerItem = function(item) {
                    ctrl.items.push(item);
                };

                // Handle item toggle
                ctrl.toggleItem = function(targetItem) {
                    if (ctrl.type === 'single') {
                        // Single mode: close all others, toggle current
                        ctrl.items.forEach(function(item) {
                            if (item !== targetItem) {
                                item.isOpen = false;
                            }
                        });
                        
                        if (ctrl.collapsible) {
                            targetItem.isOpen = !targetItem.isOpen;
                        } else {
                            targetItem.isOpen = true;
                        }
                    } else {
                        // Multiple mode: just toggle current
                        targetItem.isOpen = !targetItem.isOpen;
                    }
                };

                // Style for accordion container
                $scope.getAccordionStyle = function() {
                    return {
                        'background-color': '#FFFFFF',
                        'border-radius': '3px',
                        'border': '1px solid #DDDDDD',
                        'overflow': 'hidden'
                    };
                };
            },
            link: function(scope, element, attrs, ctrl) {
                // Setup controller reference
                scope.accordionCtrl = ctrl;
            }
        };
    }

    function accordionItem() {
        return {
            restrict: 'E',
            require: '^accordionComponent',
            scope: {
                title: '@',
                isOpen: '=?',
                disabled: '=?',
                onToggle: '&'
            },
            template: `
                <div class="accordion-item" ng-style="getItemStyle()">
                    <div class="accordion-header" 
                         ng-click="handleToggle()"
                         ng-style="getHeaderStyle()"
                         ng-class="{'accordion-header-disabled': disabled}">
                        <span class="accordion-title" ng-style="getTitleStyle()">
                            {{ title }}
                        </span>
                        <span class="accordion-icon" 
                              ng-style="getIconStyle()"
                              ng-class="{'accordion-icon-open': isOpen}">
                            ⌄
                        </span>
                    </div>
                    <div class="accordion-content" 
                         ng-show="isOpen" 
                         ng-style="getContentStyle()"
                         ng-animate="'accordion'">
                        <div class="accordion-content-inner" ng-style="getContentInnerStyle()">
                            <ng-transclude></ng-transclude>
                        </div>
                    </div>
                </div>
            `,
            transclude: true,
            link: function(scope, element, attrs, accordionCtrl) {
                // Initialize
                scope.isOpen = scope.isOpen || false;
                scope.disabled = scope.disabled || false;

                // Register with parent accordion
                accordionCtrl.registerItem(scope);

                // Handle toggle
                scope.handleToggle = function() {
                    if (scope.disabled) {
                        return;
                    }

                    accordionCtrl.toggleItem(scope);
                    
                    if (scope.onToggle) {
                        scope.onToggle({ isOpen: scope.isOpen });
                    }
                };

                // Styles
                scope.getItemStyle = function() {
                    return {
                        'border-bottom': '1px solid #DDDDDD'
                    };
                };

                scope.getHeaderStyle = function() {
                    return {
                        'padding': '16px',
                        'cursor': scope.disabled ? 'not-allowed' : 'pointer',
                        'display': 'flex',
                        'align-items': 'center',
                        'justify-content': 'space-between',
                        'background-color': scope.disabled ? '#F5F5F5' : '#FFFFFF',
                        'transition': 'background-color 0.2s ease',
                        'user-select': 'none'
                    };
                };

                scope.getTitleStyle = function() {
                    return {
                        'font-size': '14px',
                        'font-family': 'Inter, sans-serif',
                        'font-weight': '500',
                        'color': scope.disabled ? '#969CA6' : '#0D0217',
                        'line-height': '1.5',
                        'flex': '1',
                        'text-align': 'left'
                    };
                };

                scope.getIconStyle = function() {
                    return {
                        'font-size': '16px',
                        'color': scope.disabled ? '#969CA6' : '#525252',
                        'transition': 'transform 0.2s ease',
                        'transform': scope.isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        'display': 'inline-block',
                        'margin-left': '8px'
                    };
                };

                scope.getContentStyle = function() {
                    return {
                        'background-color': '#FFFFFF',
                        'overflow': 'hidden'
                    };
                };

                scope.getContentInnerStyle = function() {
                    return {
                        'padding': '0 16px 16px 16px',
                        'font-size': '14px',
                        'font-family': 'Inter, sans-serif',
                        'line-height': '1.5',
                        'color': '#525252'
                    };
                };

                // Add hover effects
                var headerElement = element.find('.accordion-header');

                element.on('mouseenter', '.accordion-header', function() {
                    if (!scope.disabled) {
                        angular.element(this).css('background-color', '#F9FAFB');
                    }
                });

                element.on('mouseleave', '.accordion-header', function() {
                    if (!scope.disabled) {
                        angular.element(this).css('background-color', '#FFFFFF');
                    }
                });

                // Clean up event listeners
                scope.$on('$destroy', function() {
                    element.off('mouseenter');
                    element.off('mouseleave');
                });

                // Watch for isOpen changes to handle animations
                scope.$watch('isOpen', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        var contentElement = element.find('.accordion-content');
                        
                        if (newVal) {
                            // Opening animation
                            contentElement.css({
                                'max-height': '0',
                                'opacity': '0'
                            });
                            
                            // Use timeout to trigger animation
                            setTimeout(function() {
                                contentElement.css({
                                    'max-height': '1000px',
                                    'opacity': '1',
                                    'transition': 'max-height 0.3s ease, opacity 0.2s ease'
                                });
                            }, 10);
                        } else {
                            // Closing animation
                            contentElement.css({
                                'max-height': '0',
                                'opacity': '0',
                                'transition': 'max-height 0.3s ease, opacity 0.2s ease'
                            });
                        }
                    }
                });
            }
        };
    }
})();