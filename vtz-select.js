class VtzSelect extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>
                .filterable-select {
                    position: relative;
                    display: block;
                    width: 100%;
                }

                input {
                    width: 100%;
                    box-sizing: border-box;
                    display: block;
                    border-radius: 2px;
                    font-size: 13px !important;
                    box-shadow: none;
                    display: block;
                    height: 34px;
                    padding: 6px 12px;
                    line-height: 1.42857143;
                    color: #555;
                    background-color: #fff;
                    border: 1px solid #ccc;
                }

                input:focus,
                input:focus-visible {
                    outline: none;
                    border-color: #820AD2;
                }

                ul {
                    list-style: none;
                    padding: 8px;
                    margin: 0;
                    max-height: 150px;
                    overflow-y: auto;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: white;
                    display: none;
                    position: absolute;
                    width: 100%;
                    z-index: 1000;
                    box-shadow: 0px 0px 1px 0px #091E424F;
                    box-shadow: 0px 8px 12px 0px #091E4226;
                    min-width: 300px;
                }

                ul.show {
                    display: block;
                }

                li {
                    height: 30px;
                    padding: 0 4px 0 12px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    line-height: 28px;
                    color: #525252;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                li:hover {
                    background-color: #F5EBFB;
                    color: #6507B4;

                }

                label {
                    font-size: 13px;
                    color: #3F4C66;
                    width: 100%;
                    height: 18px;
                    font-family: 'Inter', sans-serif !important;
                    line-height: 18px;
                    margin: 2px 0 5px;
                    font-weight: 500;
                    text-align: left;
                    display: block;
                }

                .campo-obrigatorio {
                    color: #AE2E24 !important;
                }

                .vtz-scroll::-webkit-scrollbar {width: 10px;height:12px;appearance: none}
                .vtz-scroll::-webkit-scrollbar-corner {background: #ffffff;}
                .vtz-scroll::-webkit-scrollbar-thumb {background-color: #c0c0c0;border-radius: 10px;}
                .vtz-scroll::-webkit-scrollbar-track {background: #f5f7fa;}
            </style>

            <label></label>
            <div class="filterable-select">
                <input type="text" placeholder="Selecionar">
                <ul class='vtz-scroll'></ul>
            </div>
        `;

        this.input = shadow.querySelector('input');
        this.list  = shadow.querySelector('ul');
        this.label = shadow.querySelector('label');
        this.options       = [];
        this.selectedValue = null;

        // Add click handlers
        this.input.addEventListener('click', () => this.toggleDropdown());
        this.input.addEventListener('input', () => {
            this.handleInputChange();
        });
        this.input.addEventListener('blur', () => {
            this.handleBlur();
        });

        this.list.addEventListener('click', (event) => this.selectOption(event));

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!this.contains(event.target)) {
                this.hideDropdown();
            }
        });
    }

    handleBlur() {
        setTimeout(() => {
            const inputValue = this.input.value.trim();
            
            const exactMatch = this.options.find(option => 
                option.text.toLowerCase() === inputValue.toLowerCase()
            );

            if (!exactMatch) {
                this.input.value = '';
                this.clearSelection();
            }
            
            this.hideDropdown();
        }, 150);
    }

    handleInputChange() {
        const inputValue = this.input.value;
        
        if (inputValue === '' || inputValue.trim() === '') {
            this.clearSelection();
        } else {
            const exactMatch = this.options.find(option => 
                option.text.toLowerCase() === inputValue.toLowerCase()
            );
            
            if (exactMatch) {
                this.selectedValue = exactMatch.value;
                this.updateNgModel();
            } else {
                this.selectedValue = null;
                this.updateNgModel();
            }
        }
        
        this.filterOptions();
        this.showDropdown();
    }

    clearSelection() {
        this.selectedValue = null;
        this.updateNgModel();
        this.filterOptions();
        this.dispatchChangeEvent();
    }

    updateNgModel() {
        const ngModel = this.getAttribute('ng-model');
        if (ngModel) {
            const scope = angular.element(this).scope();
            if (scope) {
                scope.$apply(() => {
                    try {
                        eval(`scope.${ngModel} = ${this.selectedValue ? `'${this.selectedValue}'` : 'null'}`);
                    } catch (e) {
                        console.warn('Erro ao atualizar ng-model:', e);
                    }
                });
            }
        }
    }

    dispatchChangeEvent() {
        const changeEvent = new Event('change', { bubbles: true });
        this.dispatchEvent(changeEvent);
    }

    toggleDropdown() {
        this.list.classList.toggle('show');
    }

    showDropdown() {
        this.list.classList.add('show');
    }

    hideDropdown() {
        this.list.classList.remove('show');
    }

    selectOption(event) {
        if (event.target.tagName.toLowerCase() === 'li') {
            const value = event.target.dataset.value;
            const text  = event.target.textContent;
            
            this.selectedValue = value;
            this.input.value   = text;
            this.hideDropdown();

            this.dispatchChangeEvent();
            this.updateNgModel();

            this.filterOptions('');
        }
    }

    connectedCallback() {
        this.label.innerHTML = this.getAttribute('label') || '';

        const opcoes = this.getAttribute('opcoes');

        if (opcoes) {
            const options = JSON.parse(opcoes);

            this.options = options.map(option => ({
                value: option.id,
                text:  option.grupo
            }));

            this.renderOptions();
        }

        const ngModel = this.getAttribute('ng-model');
        if (ngModel) {
            setTimeout(() => {
                const scope = angular.element(this).scope();
                if (scope) {
                    scope.$watch(ngModel, (newValue) => {
                        if (newValue === null || newValue === undefined || newValue === '') {
                            this.input.value = '';
                            this.selectedValue = null;
                        } else {
                            const selectedOption = this.options.find(opt => opt.value == newValue);
                            if (selectedOption) {
                                this.input.value = selectedOption.text;
                                this.selectedValue = selectedOption.value;
                            }
                        }
                    }, true);
                    scope.$apply();
                }
            }, 100);
        }

        const form = this.closest('form');
        if (form) {
            form.addEventListener('formdata', (event) => {
                const formData = event.formData;
                const name = this.getAttribute('name') || 'filterable-select';
                formData.append(name, this.selectedValue || '');
            });
        }
    }

    filterOptions(forceQuery = undefined) {
        const query = typeof forceQuery != 'undefined' ? forceQuery : this.input.value.toLowerCase();
        const filteredOptions = this.options.filter(option =>
            option.text.toLowerCase().includes(query)
        );
        this.renderOptions(filteredOptions);
    }

    renderOptions(filteredOptions = this.options) {
        this.list.innerHTML = '';
        filteredOptions.forEach(option => {
            const li = document.createElement('li');
            li.textContent = option.text;
            li.dataset.value = option.value;
            this.list.appendChild(li);
        });
    }

    static get observedAttributes() {
        return ['opcoes'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'opcoes') {
            const opcoes = this.getAttribute('opcoes');

            if (opcoes) {
                const options = JSON.parse(opcoes);

                this.options = options.map(option => ({
                    value: option.id,
                    text:  option.grupo
                }));

                this.renderOptions();
            }
        }
    }

    get value() {
        return this.selectedValue;
    }

    set value(val) {
        this.selectedValue = val;

        if (val === null || val === undefined || val === '') {
            this.input.value = '';
        } else {
            const selectedOption = this.options.find(opt => opt.value == val);
            if (selectedOption) {
                this.input.value = selectedOption.text;
            }
        }
    }
}

customElements.define('vtz-select-3', VtzSelect);