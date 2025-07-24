(function() {
    'use strict';

    angular.module('systemApp')
        .directive('tabComponent', tabComponent);

    function tabComponent() {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                isActive: '=',
                onTabClick: '&'
            },
            template: `
                <div class="tab-item" 
                     ng-class="{'tab-active': isActive, 'tab-inactive': !isActive}"
                     ng-click="handleClick()"
                     ng-style="getTabStyle()">
                    <span class="tab-title" 
                          ng-class="{'tab-title-active': isActive, 'tab-title-inactive': !isActive}"
                          ng-style="getTitleStyle()">
                        {{ title }}
                    </span>
                </div>
            `,
            link: function(scope, element, attrs) {
                // Handle click event
                scope.handleClick = function() {
                    if (scope.onTabClick) {
                        scope.onTabClick();
                    }
                };

                // Dynamic styles for tab container
                scope.getTabStyle = function() {
                    return {
                        'background-color': '#FFFFFF',
                        'padding': '12px 8px',
                        'display': 'flex',
                        'align-items': 'center',
                        'height': '48px',
                        'cursor': 'pointer',
                        'transition': 'background-color 0.2s ease',
                        'border-bottom': scope.isActive ? '2px solid #6507B4' : '1px solid #DDDDDD'
                    };
                };

                // Dynamic styles for title text
                scope.getTitleStyle = function() {
                    return {
                        'font-size': '14px',
                        'font-family': 'Inter, sans-serif',
                        'font-weight': scope.isActive ? '600' : '400',
                        'color': scope.isActive ? '#6507B4' : '#0D0217',
                        'line-height': '1.5'
                    };
                };

                // Add hover effect
                element.on('mouseenter', function() {
                    if (!scope.isActive) {
                        element.find('div').first().css('background-color', '#F9FAFB');
                    }
                });

                element.on('mouseleave', function() {
                    if (!scope.isActive) {
                        element.find('div').first().css('background-color', '#FFFFFF');
                    }
                });

                // Clean up event listeners
                scope.$on('$destroy', function() {
                    element.off('mouseenter');
                    element.off('mouseleave');
                });
            }
        };
    }
})();