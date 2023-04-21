const { getConnection, raw } = require('../../../services/database')

jest.mock('../../../services/database')

const repository = require('./repositories')

describe('statistics repositories', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should export 4 methods', () => {
    expect(repository).toEqual({
      occupancyByYear: expect.any(Function),
      occupancyByYearAndMonth: expect.any(Function),
      totalRevenue: expect.any(Function),
      reservationsByCountry: expect.any(Function),
      calculateOccupancy: expect.any(Function),
    })
  })

  describe('reservationsByCountry', () => {
    const accountId = 1
    const propertyId = 10

    it('should return statistics for each country with years and property', async () => {
      const statistics = [
        {
          countryCode: null,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          countryCode: null,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          countryCode: null,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          countryCode: 'gb',
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          countryCode: 'uk',
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          countryCode: 'tk',
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          countryCode: 'pl',
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          countryCode: 'po',
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
      ]

      const orderByRawFinal = jest.fn().mockResolvedValue(statistics)
      const orderByRawAvg = jest.fn().mockReturnValue({ orderByRaw: orderByRawFinal })
      const groupByCountry = jest.fn().mockReturnValue({ orderByRaw: orderByRawAvg })
      const groupByRaw = jest.fn().mockReturnValue({ groupBy: groupByCountry })
      const propertyQueryBuilder = { where: jest.fn() }
      const andWhere = jest.fn().mockImplementation((fn) => {
        fn(propertyQueryBuilder)

        return { groupByRaw }
      })
      const whereRaw = jest.fn().mockReturnValue({ andWhere })
      const whereIn = jest.fn().mockReturnValue({ whereRaw })
      const where = jest.fn().mockReturnValue({ whereIn })
      const leftJoinGuests = jest.fn().mockReturnValue({ where })
      const leftJoinBookingGuests = jest.fn().mockReturnValue({ leftJoin: leftJoinGuests })
      const from = jest.fn().mockReturnValue({ leftJoin: leftJoinBookingGuests })
      raw.mockReturnValueOnce('YEAR(b.created_at) AS year')
      raw.mockReturnValueOnce('AVG(b.amount_total - b.amount_total_tax) AS total')
      const select = jest.fn().mockReturnValue({ from })
      getConnection.mockReturnValue({ select })

      const response = {
        labels: [
          'gb',
          'uk',
          'tk',
          'pl',
          'po',
          'OTHER',
        ],
        data: {
          2020: [
            { currency: 'EUR', total: 0 },
            { currency: 'EUR', total: 0 },
            { currency: 'EUR', total: 0 },
            { currency: 'EUR', total: 0 },
            { currency: 'EUR', total: 0 },
            { currency: 'EUR', total: 0 },
          ],
          2021: [
            {
              countryCode: 'gb',
              currency: 'EUR',
              total: 10,
              year: 2021,
            },
            {
              countryCode: 'uk',
              currency: 'EUR',
              total: 10,
              year: 2021,
            },
            {
              countryCode: 'tk',
              currency: 'EUR',
              total: 10,
              year: 2021,
            },
            {
              countryCode: 'pl',
              currency: 'EUR',
              total: 10,
              year: 2021,
            },
            {
              countryCode: 'po',
              currency: 'EUR',
              total: 10,
              year: 2021,
            },
            {
              countryCode: 'OTHER',
              currency: 'EUR',
              total: 30,
              year: 2021,
            },
          ],
        },
      }

      await expect(repository.reservationsByCountry(accountId)([2021, 2020], propertyId))
        .resolves.toEqual(response)

      expect(getConnection).toBeCalled()
      expect(select).toBeCalledWith([
        'YEAR(b.created_at) AS year',
        'AVG(b.amount_total - b.amount_total_tax) AS total',
        'g.country_code',
        'b.currency',
      ])
      expect(raw).toBeCalledWith('YEAR(b.created_at) AS year')
      expect(raw).toBeCalledWith('AVG(b.amount_total - b.amount_total_tax) AS total')
      expect(from).toBeCalledWith('bookings AS b')
      expect(leftJoinBookingGuests).toBeCalledWith('booking_guests AS bg', 'bg.booking_id', 'b.id')
      expect(leftJoinGuests).toBeCalledWith('guests AS g', 'bg.guest_id', 'g.id')
      expect(where).toBeCalledWith('b.account_id', '=', accountId)
      expect(whereIn).toBeCalledWith('b.status', ['confirmed'])
      expect(whereRaw).toBeCalledWith('YEAR(b.created_at) IN (2021,2020)')
      expect(andWhere).toBeCalledWith(expect.any(Function))
      expect(propertyQueryBuilder.where).toBeCalledWith('b.property_id', '=', propertyId)
      expect(groupByRaw).toBeCalledWith('YEAR(b.created_at)')
      expect(groupByCountry).toBeCalledWith('g.country_code')
      expect(orderByRawAvg).toBeCalledWith('AVG(b.amount_total - b.amount_total_tax) DESC')
      expect(orderByRawFinal).toBeCalledWith('YEAR(b.created_at) DESC')
    })

    it('should return statistics for each country', async () => {
      const statistics = [
        {
          countryCode: null,
          total: 0,
          currency: 'EUR',
          year: 2021,
        },
      ]

      const orderByRawFinal = jest.fn().mockResolvedValue(statistics)
      const orderByRawAvg = jest.fn().mockReturnValue({ orderByRaw: orderByRawFinal })
      const groupByCountry = jest.fn().mockReturnValue({ orderByRaw: orderByRawAvg })
      const groupByRaw = jest.fn().mockReturnValue({ groupBy: groupByCountry })
      const propertyQueryBuilder = { where: jest.fn() }
      const andWhere = jest.fn().mockImplementation((fn) => {
        fn(propertyQueryBuilder)

        return { groupByRaw }
      })
      const whereRaw = jest.fn().mockReturnValue({ andWhere })
      const whereIn = jest.fn().mockReturnValue({ whereRaw })
      const where = jest.fn().mockReturnValue({ whereIn })
      const leftJoinGuests = jest.fn().mockReturnValue({ where })
      const leftJoinBookingGuests = jest.fn().mockReturnValue({ leftJoin: leftJoinGuests })
      const from = jest.fn().mockReturnValue({ leftJoin: leftJoinBookingGuests })
      raw.mockReturnValueOnce('YEAR(b.created_at) AS year')
      raw.mockReturnValueOnce('AVG(b.amount_total - b.amount_total_tax) AS total')
      const select = jest.fn().mockReturnValue({ from })
      getConnection.mockReturnValue({ select })

      const response = {
        labels: [
          'OTHER',
        ],
        data: {
          2021: [
            {
              countryCode: 'OTHER',
              currency: 'EUR',
              total: 0,
              year: 2021,
            },
          ],
          undefined: [
            {
              currency: 'EUR',
              total: 0,
            },
          ],
        },
      }

      await expect(repository.reservationsByCountry(accountId)())
        .resolves.toEqual(response)

      expect(getConnection).toBeCalled()
      expect(select).toBeCalledWith([
        'YEAR(b.created_at) AS year',
        'AVG(b.amount_total - b.amount_total_tax) AS total',
        'g.country_code',
        'b.currency',
      ])
      expect(raw).toBeCalledWith('YEAR(b.created_at) AS year')
      expect(raw).toBeCalledWith('AVG(b.amount_total - b.amount_total_tax) AS total')
      expect(from).toBeCalledWith('bookings AS b')
      expect(leftJoinBookingGuests).toBeCalledWith('booking_guests AS bg', 'bg.booking_id', 'b.id')
      expect(leftJoinGuests).toBeCalledWith('guests AS g', 'bg.guest_id', 'g.id')
      expect(where).toBeCalledWith('b.account_id', '=', accountId)
      expect(whereIn).toBeCalledWith('b.status', ['confirmed'])
      expect(whereRaw).toBeCalledWith('YEAR(b.created_at) IN ()')
      expect(andWhere).toBeCalledWith(expect.any(Function))
      expect(propertyQueryBuilder.where).not.toBeCalled()
      expect(groupByRaw).toBeCalledWith('YEAR(b.created_at)')
      expect(groupByCountry).toBeCalledWith('g.country_code')
      expect(orderByRawAvg).toBeCalledWith('AVG(b.amount_total - b.amount_total_tax) DESC')
      expect(orderByRawFinal).toBeCalledWith('YEAR(b.created_at) DESC')
    })
  })

  describe('totalRevenue', () => {
    const accountId = 1
    const propertyId = 10

    it('should return revenue statistics with years and property', async () => {
      const statistics = [
        {
          month: 1,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          month: 2,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          month: 3,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
      ]

      const orderByRawFinal = jest.fn().mockResolvedValue(statistics)
      const orderByRawYear = jest.fn().mockReturnValue({ orderByRaw: orderByRawFinal })
      const groupByMonth = jest.fn().mockReturnValue({ orderByRaw: orderByRawYear })
      const groupByYear = jest.fn().mockReturnValue({ groupByRaw: groupByMonth })
      const propertyQueryBuilder = { where: jest.fn() }
      const andWhere = jest.fn().mockImplementation((fn) => {
        fn(propertyQueryBuilder)

        return { groupByRaw: groupByYear }
      })
      const whereRaw = jest.fn().mockReturnValue({ andWhere })
      const whereIn = jest.fn().mockReturnValue({ whereRaw })
      const where = jest.fn().mockReturnValue({ whereIn })
      const from = jest.fn().mockReturnValue({ where })
      raw.mockReturnValueOnce('YEAR(b.created_at) AS year')
      raw.mockReturnValueOnce('MONTH(b.created_at) AS month')
      raw.mockReturnValueOnce('SUM(b.amount_total - b.amount_total_tax) AS total')
      const select = jest.fn().mockReturnValue({ from })
      getConnection.mockReturnValue({ select })

      const response = {
        2020: [
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
        ],
        2021: [
          { currency: 'EUR', total: 10 },
          { currency: 'EUR', total: 10 },
          { currency: 'EUR', total: 10 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
        ],
      }

      await expect(repository.totalRevenue(accountId)([2021, 2020], propertyId))
        .resolves.toEqual(response)

      expect(getConnection).toBeCalled()
      expect(select).toBeCalledWith([
        'YEAR(b.created_at) AS year',
        'MONTH(b.created_at) AS month',
        'SUM(b.amount_total - b.amount_total_tax) AS total',
        'b.currency',
      ])
      expect(raw).toBeCalledWith('YEAR(b.created_at) AS year')
      expect(raw).toBeCalledWith('MONTH(b.created_at) AS month')
      expect(raw).toBeCalledWith('SUM(b.amount_total - b.amount_total_tax) AS total')
      expect(from).toBeCalledWith('bookings AS b')
      expect(where).toBeCalledWith('b.account_id', '=', accountId)
      expect(whereIn).toBeCalledWith('b.status', ['confirmed'])
      expect(whereRaw).toBeCalledWith('YEAR(b.created_at) IN (2021,2020)')
      expect(andWhere).toBeCalledWith(expect.any(Function))
      expect(propertyQueryBuilder.where).toBeCalledWith('b.property_id', '=', propertyId)
      expect(groupByYear).toBeCalledWith('YEAR(b.created_at)')
      expect(groupByMonth).toBeCalledWith('MONTH(b.created_at)')
      expect(orderByRawYear).toBeCalledWith('YEAR(b.created_at) DESC')
      expect(orderByRawFinal).toBeCalledWith('MONTH(b.created_at) ASC')
    })

    it('should return revenue statistics', async () => {
      const statistics = [
        {
          month: 1,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          month: 2,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
        {
          month: 3,
          total: 10,
          currency: 'EUR',
          year: 2021,
        },
      ]

      const orderByRawFinal = jest.fn().mockResolvedValue(statistics)
      const orderByRawYear = jest.fn().mockReturnValue({ orderByRaw: orderByRawFinal })
      const groupByMonth = jest.fn().mockReturnValue({ orderByRaw: orderByRawYear })
      const groupByYear = jest.fn().mockReturnValue({ groupByRaw: groupByMonth })
      const propertyQueryBuilder = { where: jest.fn() }
      const andWhere = jest.fn().mockImplementation((fn) => {
        fn(propertyQueryBuilder)

        return { groupByRaw: groupByYear }
      })
      const whereRaw = jest.fn().mockReturnValue({ andWhere })
      const whereIn = jest.fn().mockReturnValue({ whereRaw })
      const where = jest.fn().mockReturnValue({ whereIn })
      const from = jest.fn().mockReturnValue({ where })
      raw.mockReturnValueOnce('YEAR(b.created_at) AS year')
      raw.mockReturnValueOnce('MONTH(b.created_at) AS month')
      raw.mockReturnValueOnce('SUM(b.amount_total - b.amount_total_tax) AS total')
      const select = jest.fn().mockReturnValue({ from })
      getConnection.mockReturnValue({ select })

      const response = {
        2021: [
          { currency: 'EUR', total: 10 },
          { currency: 'EUR', total: 10 },
          { currency: 'EUR', total: 10 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
        ],
        undefined: [
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
          { currency: 'EUR', total: 0 },
        ],
      }

      await expect(repository.totalRevenue(accountId)())
        .resolves.toEqual(response)

      expect(getConnection).toBeCalled()
      expect(select).toBeCalledWith([
        'YEAR(b.created_at) AS year',
        'MONTH(b.created_at) AS month',
        'SUM(b.amount_total - b.amount_total_tax) AS total',
        'b.currency',
      ])
      expect(raw).toBeCalledWith('YEAR(b.created_at) AS year')
      expect(raw).toBeCalledWith('MONTH(b.created_at) AS month')
      expect(raw).toBeCalledWith('SUM(b.amount_total - b.amount_total_tax) AS total')
      expect(from).toBeCalledWith('bookings AS b')
      expect(where).toBeCalledWith('b.account_id', '=', accountId)
      expect(whereIn).toBeCalledWith('b.status', ['confirmed'])
      expect(whereRaw).toBeCalledWith('YEAR(b.created_at) IN ()')
      expect(andWhere).toBeCalledWith(expect.any(Function))
      expect(propertyQueryBuilder.where).not.toBeCalled()
      expect(groupByYear).toBeCalledWith('YEAR(b.created_at)')
      expect(groupByMonth).toBeCalledWith('MONTH(b.created_at)')
      expect(orderByRawYear).toBeCalledWith('YEAR(b.created_at) DESC')
      expect(orderByRawFinal).toBeCalledWith('MONTH(b.created_at) ASC')
    })
  })

  describe('occupancyByYear', () => {
    const accountId = 1
    const propertyId = 10

    it('should return occupancy statistics with years and property', async () => {
      const statistics = [
        {
          id: 1,
          propertyUnitTypeUnitId: 1,
          dateArrival: '2021-06-01T12:54:23.866Z',
          dateDeparture: '2021-07-21T12:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
        {
          id: 2,
          propertyUnitTypeUnitId: 2,
          dateArrival: '2021-06-01T12:54:23.866Z',
          dateDeparture: '2021-06-10T12:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
        {
          id: 3,
          propertyUnitTypeUnitId: 3,
          dateArrival: '2021-06-01T12:54:23.866Z',
          dateDeparture: '2021-06-01T15:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
        {
          id: 4,
          propertyUnitTypeUnitId: 1,
          dateArrival: '2021-09-30T12:54:23.866Z',
          dateDeparture: '2021-12-01T12:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
      ]

      const response = {
        2020: [
          [], [], [], [], [], [], [], [], [], [], [], [],
        ],
        2021: [
          [],
          [],
          [],
          [],
          [],
          [
            {
              amount: 3.3333333333333335,
              currency: 'EUR',
              daysInMonth: 30,
              propertyUnitTypeUnitId: 1,
              totalNights: 30,
            },
            {
              amount: 11.11111111111111,
              currency: 'EUR',
              daysInMonth: 30,
              propertyUnitTypeUnitId: 2,
              totalNights: 9,
            },
          ],
          [
            {
              amount: 5,
              currency: 'EUR',
              daysInMonth: 31,
              propertyUnitTypeUnitId: 1,
              totalNights: 20,
            },
          ],
          [],
          [
            {
              amount: 100,
              currency: 'EUR',
              daysInMonth: 30,
              propertyUnitTypeUnitId: 1,
              totalNights: 1,
            },
          ],
          [],
          [],
          [],
        ],
      }

      const orderByRawFinal = jest.fn().mockResolvedValue(statistics)
      const orderByRawYear = jest.fn().mockReturnValue({ orderByRaw: orderByRawFinal })
      const propertyQueryBuilder = { where: jest.fn() }
      const andWhere = jest.fn().mockImplementation((fn) => {
        fn(propertyQueryBuilder)

        return { orderByRaw: orderByRawYear }
      })
      const whereRaw = jest.fn().mockReturnValue({ andWhere })
      const whereIn = jest.fn().mockReturnValue({ whereRaw })
      const where = jest.fn().mockReturnValue({ whereIn })
      const from = jest.fn().mockReturnValue({ where })
      const select = jest.fn().mockReturnValue({ from })
      getConnection.mockReturnValue({ select })
      raw.mockReturnValueOnce('amount_total')

      await expect(repository.occupancyByYear(accountId)([2021, 2020], propertyId))
        .resolves.toEqual(response)

      expect(getConnection).toBeCalled()
      expect(select).toBeCalledWith([
        'id',
        'property_unit_type_unit_id',
        'date_arrival',
        'date_departure',
        'amount_total',
        'currency',
      ])
      expect(from).toBeCalledWith('bookings')
      expect(where).toBeCalledWith('account_id', '=', accountId)
      expect(whereIn).toBeCalledWith('status', ['confirmed'])
      expect(whereRaw).toBeCalledWith('YEAR(date_arrival) IN (2021,2020)')
      expect(andWhere).toBeCalledWith(expect.any(Function))
      expect(propertyQueryBuilder.where).toBeCalledWith('property_id', '=', propertyId)
      expect(orderByRawYear).toBeCalledWith('YEAR(date_arrival) DESC')
      expect(orderByRawFinal).toBeCalledWith('MONTH(date_arrival) ASC')
    })

    it('should return occupancy statistics', async () => {
      const statistics = [
        {
          id: 1,
          propertyUnitTypeUnitId: 1,
          dateArrival: '2021-06-01T12:54:23.866Z',
          dateDeparture: '2021-07-21T12:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
        {
          id: 2,
          propertyUnitTypeUnitId: 2,
          dateArrival: '2021-06-01T12:54:23.866Z',
          dateDeparture: '2021-06-10T12:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
        {
          id: 3,
          propertyUnitTypeUnitId: 3,
          dateArrival: '2021-06-01T12:54:23.866Z',
          dateDeparture: '2021-06-01T15:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
        {
          id: 4,
          propertyUnitTypeUnitId: 1,
          dateArrival: '2021-09-30T12:54:23.866Z',
          dateDeparture: '2022-12-01T12:54:23.866Z',
          amountTotal: 100,
          currency: 'EUR',
        },
      ]

      const response = {
        undefined: [
          [], [], [], [], [], [], [], [], [], [], [], [],
        ],
        2022: [
          [], [], [], [], [], [], [], [], [], [], [], [],
        ],
        2021: [
          [],
          [],
          [],
          [],
          [],
          [
            {
              amount: 3.3333333333333335,
              currency: 'EUR',
              daysInMonth: 30,
              propertyUnitTypeUnitId: 1,
              totalNights: 30,
            },
            {
              amount: 11.11111111111111,
              currency: 'EUR',
              daysInMonth: 30,
              propertyUnitTypeUnitId: 2,
              totalNights: 9,
            },
          ],
          [
            {
              amount: 5,
              currency: 'EUR',
              daysInMonth: 31,
              propertyUnitTypeUnitId: 1,
              totalNights: 20,
            },
          ],
          [],
          [
            {
              amount: 100,
              currency: 'EUR',
              daysInMonth: 30,
              propertyUnitTypeUnitId: 1,
              totalNights: 1,
            },
          ],
          [],
          [],
          [],
        ],
      }

      const orderByRawFinal = jest.fn().mockResolvedValue(statistics)
      const orderByRawYear = jest.fn().mockReturnValue({ orderByRaw: orderByRawFinal })
      const propertyQueryBuilder = { where: jest.fn() }
      const andWhere = jest.fn().mockImplementation((fn) => {
        fn(propertyQueryBuilder)

        return { orderByRaw: orderByRawYear }
      })
      const whereRaw = jest.fn().mockReturnValue({ andWhere })
      const whereIn = jest.fn().mockReturnValue({ whereRaw })
      const where = jest.fn().mockReturnValue({ whereIn })
      const from = jest.fn().mockReturnValue({ where })
      const select = jest.fn().mockReturnValue({ from })
      getConnection.mockReturnValue({ select })
      raw.mockReturnValueOnce('amount_total')

      await expect(repository.occupancyByYear(accountId)())
        .resolves.toEqual(response)

      expect(getConnection).toBeCalled()
      expect(select).toBeCalledWith([
        'id',
        'property_unit_type_unit_id',
        'date_arrival',
        'date_departure',
        'amount_total',
        'currency',
      ])
      expect(from).toBeCalledWith('bookings')
      expect(where).toBeCalledWith('account_id', '=', accountId)
      expect(whereIn).toBeCalledWith('status', ['confirmed'])
      expect(whereRaw).toBeCalledWith('YEAR(date_arrival) IN ()')
      expect(andWhere).toBeCalledWith(expect.any(Function))
      expect(propertyQueryBuilder.where).not.toBeCalled()
      expect(orderByRawYear).toBeCalledWith('YEAR(date_arrival) DESC')
      expect(orderByRawFinal).toBeCalledWith('MONTH(date_arrival) ASC')
    })
  })
})
