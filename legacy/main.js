// Generated by CoffeeScript 1.6.3
(function() {
  var Account, ApplicationModel, Business, Contract, Contractor, Document, DocumentItem, DocumentItems, File, Files, PowerOfAttorney, lowercase, snake, valueFn,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  lowercase = function(value) {
    if (_.isString(value)) {
      return value.toLowerCase();
    }
    return value;
  };

  snake = function(value) {
    return _.map(value.match(/[A-Z]?[a-z]+/g), function(part) {
      return lowercase(part);
    }).join('_');
  };

  valueFn = function(value) {
    return value;
  };

  ApplicationModel = (function() {
    var createGetter, createSetter;

    createGetter = function(prop_name, attributes) {
      return function() {
        return attributes[prop_name];
      };
    };

    createSetter = function(prop_name, fn, attributes) {
      return function(value) {
        return attributes[prop_name] = fn(value);
      };
    };

    function ApplicationModel(params, defaults) {
      var formatters, getters, getters_setters, parsers, setters;
      this.__attributes = {};
      getters = this.__getters = this.getGetters();
      setters = this.__setters = this.getSetters();
      parsers = this.__parsers = this.getParsers();
      formatters = this.__formatters = this.getFormatters();
      getters_setters = _.difference(_.union(_.keys(getters), _.keys(setters)), _.keys(parsers));
      _.each(parsers, function(functionName, prop_name) {
        return Object.defineProperty(this, prop_name, {
          enumerable: true,
          get: createGetter(prop_name, this.__attributes),
          set: createSetter(prop_name, this[functionName], this.__attributes)
        });
      }, this);
      _.each(getters_setters, function(prop_name) {
        return Object.defineProperty(this, prop_name, {
          enumerable: true,
          get: this[getters[prop_name]],
          set: this[setters[prop_name]]
        });
      }, this);
      _.assign(defaults, params);
      _.assign(this, defaults);
    }

    ApplicationModel.prototype.toPlainObject = function() {
      var _resolve;
      _resolve = function(value) {
        if (value instanceof ApplicationModel) {
          return value.toPlainObject();
        }
        if (_.isArray(value)) {
          return _.map(value, _resolve);
        }
        if (value) {
          return JSON.parse(JSON.stringify(value));
        }
        return value;
      };
      return _.reduce(this.getOwnKeys(), function(result, key) {
        result[key] = _resolve(this[key]);
        return result;
      }, {}, this);
    };

    ApplicationModel.prototype.format = function() {
      var _resolve;
      _resolve = function(value) {
        if (value instanceof ApplicationModel) {
          return value.format();
        }
        if (_.isArray(value)) {
          return _.map(value, _resolve);
        }
        if (value) {
          return JSON.parse(JSON.stringify(value));
        }
        return value;
      };
      return _.reduce(this.getOwnKeys(), function(result, key) {
        var formatter;
        formatter = this[this.__formatters[key]] || valueFn;
        result[key] = _resolve(formatter.call(this, this[key]));
        return result;
      }, {}, this);
    };

    ApplicationModel.prototype.getOwnKeys = function() {
      return _.reject(_.keys(this), function(key) {
        return key.indexOf('__') === 0;
      });
    };

    ApplicationModel.prototype.getMutators = function(type) {
      var methods, mutators, pattern;
      methods = _.methods(this);
      pattern = new RegExp(type + '(\\w+)Attribute');
      mutators = _.filter(methods, function(method) {
        return pattern.test(method);
      });
      return _.reduce(mutators, function(result, mutator_name) {
        var prop_name;
        prop_name = snake(mutator_name.match(pattern)[1]);
        result[prop_name] = mutator_name;
        return result;
      }, {});
    };

    ApplicationModel.prototype.getGetters = function() {
      return this.getMutators('get');
    };

    ApplicationModel.prototype.getSetters = function() {
      return this.getMutators('set');
    };

    ApplicationModel.prototype.getParsers = function() {
      return this.getMutators('parse');
    };

    ApplicationModel.prototype.getFormatters = function() {
      return this.getMutators('format');
    };

    return ApplicationModel;

  })();

  Contractor = (function(_super) {
    var default_contractor, kpgf_titles;

    __extends(Contractor, _super);

    default_contractor = {
      business_title: '',
      okpo_inn: '',
      kpgf_entry: 1,
      kpgf_title: '',
      name_surname: '',
      name_name: '',
      name_patronymic: '',
      name: ''
    };

    kpgf_titles = {
      '1': 'ФОП',
      '-1': '',
      '240': 'ТОВ'
    };

    function Contractor(params) {
      Contractor.__super__.constructor.call(this, params, default_contractor);
    }

    Contractor.prototype.getNameAttribute = function() {
      return _.compact([this.name_surname, this.name_name, this.name_patronymic]).join(' ');
    };

    Contractor.prototype.getBusinessTitleAttribute = function() {
      return _.compact([this.kpgf_title, this.name]).join(' ');
    };

    Contractor.prototype.getKpgfTitleAttribute = function() {
      return kpgf_titles[this.kpgf_entry];
    };

    Contractor.prototype.setNameAttribute = function(name) {
      var parts;
      if (name == null) {
        name = '';
      }
      parts = name.toString().split(' ');
      this.name_surname = parts.shift();
      this.name_patronymic = parts.pop();
      return this.name_name = parts.join(' ');
    };

    return Contractor;

  })(ApplicationModel);

  Business = (function(_super) {
    __extends(Business, _super);

    function Business(params) {
      Business.__super__.constructor.call(this, params);
    }

    return Business;

  })(Contractor);

  Contract = (function(_super) {
    var default_contract;

    __extends(Contract, _super);

    default_contract = {
      number: '',
      date_created: new Date().setHours(0, 0, 0, 0),
      transactional: false,
      "private": false
    };

    function Contract(params) {
      Contract.__super__.constructor.call(this, params, default_contract);
    }

    return Contract;

  })(ApplicationModel);

  File = (function(_super) {
    var default_file;

    __extends(File, _super);

    default_file = {
      title: '',
      id: '',
      extension: ''
    };

    function File(params) {
      File.__super__.constructor.call(this, params, default_file);
    }

    File.prototype.formatExtensionAttribute = function() {
      return null;
    };

    return File;

  })(ApplicationModel);

  Files = (function() {
    function Files(files) {
      return _.map(files, function(file) {
        return new File(file);
      });
    }

    return Files;

  })();

  DocumentItem = (function(_super) {
    var default_item;

    __extends(DocumentItem, _super);

    default_item = {
      title: '',
      unit: '',
      quantity: 1,
      price: 0
    };

    function DocumentItem(params) {
      DocumentItem.__super__.constructor.call(this, params, default_item);
    }

    DocumentItem.prototype.getTotalAttribute = function() {
      return this.quantity * this.price;
    };

    DocumentItem.prototype.setTotalAttribute = function(total) {
      return this.price = total / this.quantity;
    };

    return DocumentItem;

  })(ApplicationModel);

  DocumentItems = (function() {
    function DocumentItems(items) {
      return _.map(items, function(item) {
        return new DocumentItem(item);
      });
    }

    return DocumentItems;

  })();

  PowerOfAttorney = (function(_super) {
    var defaults;

    __extends(PowerOfAttorney, _super);

    defaults = {
      enabled: false,
      number: ''
    };

    function PowerOfAttorney(params) {
      PowerOfAttorney.__super__.constructor.call(this, params, defaults);
    }

    PowerOfAttorney.prototype.formatEnabledAttribute = function() {
      return null;
    };

    return PowerOfAttorney;

  })(ApplicationModel);

  Account = (function(_super) {
    var default_account;

    __extends(Account, _super);

    default_account = {
      mfo: '',
      number: '',
      mfo_title: '',
      description: ''
    };

    function Account(params) {
      Account.__super__.constructor.call(this, params, default_account);
    }

    return Account;

  })(ApplicationModel);

  Document = (function(_super) {
    var default_document, _accumulateAmounts;

    __extends(Document, _super);

    default_document = {
      amount_person: null,
      date_created: new Date().setHours(0, 0, 0, 0),
      direction: 'out',
      files: [],
      items: [],
      print_comment: false,
      "private": false,
      type: 'bills'
    };

    _accumulateAmounts = function(sum, item) {
      return sum + item.total;
    };

    function Document(params) {
      Document.__super__.constructor.call(this, params, default_document);
    }

    Document.prototype.parseDateCreatedAttribute = function(value) {
      if (_.isNumber(value)) {
        return value;
      }
      return new Date(value).valueOf();
    };

    Document.prototype.parseFilesAttribute = function(files) {
      if (_.isEmpty(files) || files[0] instanceof File) {
        return files;
      }
      return new Files(files);
    };

    Document.prototype.parseItemsAttribute = function(items) {
      if (_.isEmpty(items) || items[0] instanceof DocumentItem) {
        return items;
      }
      return new DocumentItems(items);
    };

    Document.prototype.parseBusinessAttribute = function(business) {
      if (business instanceof Business) {
        return business;
      }
      return new Business(business);
    };

    Document.prototype.parseContractAttribute = function(contract) {
      if (!contract || contract instanceof Contract) {
        return contract;
      }
      return new Contract(contract);
    };

    Document.prototype.parseContractorAttribute = function(contractor) {
      if (!contractor || contractor instanceof Contractor) {
        return contractor;
      }
      return new Contractor(contractor);
    };

    Document.prototype.parseParentDocumentAttribute = function(parent_document) {
      if (parent_document) {
        if (parent_document instanceof Document) {
          return parent_document;
        }
        return new Document(parent_document);
      }
      return null;
    };

    Document.prototype.parsePowerOfAttorneyAttribute = function(power_of_attorney) {
      if (power_of_attorney) {
        if (power_of_attorney instanceof PowerOfAttorney) {
          return power_of_attorney;
        }
        return new PowerOfAttorney(power_of_attorney);
      }
      return null;
    };

    Document.prototype.parseAccountAttribute = function(account) {
      if (account) {
        if (account instanceof Account) {
          return account;
        }
        return new Account(account);
      }
      return null;
    };

    Document.prototype.getAmountAttribute = function() {
      return _.reduce(this.items, _accumulateAmounts, 0);
    };

    Document.prototype.getBusinessDataAttribute = function() {
      return _.pick(this.business, ['_id', 'business_title', 'kpgf_entry', 'kpgf_title', 'okpo_inn']);
    };

    Document.prototype.getBusinessIdAttribute = function() {
      var _ref;
      return (_ref = this.business) != null ? _ref._id : void 0;
    };

    Document.prototype.getContractIdAttribute = function() {
      var _ref;
      return (_ref = this.contract) != null ? _ref._id : void 0;
    };

    Document.prototype.getContractorDataAttribute = function() {
      return _.pick(this.contractor, ['_id', 'business_title', 'kpgf_entry', 'kpgf_title', 'okpo_inn']);
    };

    Document.prototype.getContractorIdAttribute = function() {
      var _ref;
      return (_ref = this.contractor) != null ? _ref._id : void 0;
    };

    Document.prototype.getParentDocumentIdAttribute = function() {
      if (this.parent_document) {
        return this.parent_document._id;
      }
      return null;
    };

    Document.prototype.getAccountIdAttribute = function() {
      if (this.account) {
        return this.account._id;
      }
      return null;
    };

    Document.prototype.formatTitleAttribute = function() {
      if (this.direction === 'out') {
        return this.title;
      }
      return null;
    };

    Document.prototype.formatAmountPersonAttribute = function() {
      if (this.direction === 'in' && this.contractor && this.contractor.kpgf_entry < 0) {
        return this.amount_person;
      }
      return null;
    };

    Document.prototype.formatDateCreatedAttribute = function() {
      return new Date(this.date_created).toISOString();
    };

    Document.prototype.formatPowerOfAttorneyAttribute = function() {
      var _ref;
      if ((_ref = this.power_of_attorney) != null ? _ref.enabled : void 0) {
        return this.power_of_attorney.format();
      }
      return null;
    };

    Document.prototype.formatPlaceAttribute = function() {
      if (!this.contractor["default"]) {
        return this.place;
      }
      return null;
    };

    Document.prototype.formatParentDocumentAttribute = function() {
      return null;
    };

    Document.prototype.formatContractAttribute = function() {
      return null;
    };

    return Document;

  })(ApplicationModel);

  console.log(window.doc = new Document({
    files: [
      {
        extension: 'PDF'
      }
    ],
    items: [
      {
        price: 10
      }, {
        quantity: 12,
        price: 11,
        total: 100
      }, {
        quantity: 45,
        total: 15000
      }
    ],
    business: {
      name: 'Будяков Эльдар Никонорович',
      kpgf_entry: '1',
      okpo_inn: '3331515751'
    },
    contractor: {
      name: 'Кривоухов Егор Павлович',
      kpgf_entry: '-1',
      okpo_inn: ''
    }
  }));

}).call(this);
